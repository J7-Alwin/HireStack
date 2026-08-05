import {
  Role,
  InterviewStatus,
  InterviewMode,
  Prisma,
  PipelineStage,
  PipelineTimelineEventType,
} from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { TimelineFactory } from "../../pipeline/services/timeline.factory";
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  ValidationError,
} from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { logger } from "../../../shared/logger/logger";
import { INTERVIEW_MESSAGES, STATUS_TRANSITION_RULES } from "../constants/interview.constants";
import { interviewRepository } from "../repository/interview.repository";
import {
  CreateInterviewInput,
  UpdateInterviewInput,
  UpdateStatusInput,
  RescheduleInterviewInput,
  CancelInterviewInput,
  OutcomeInput,
  AssignInterviewersInput,
  InterviewQueryFilters,
} from "../types/interview.types";
import {
  createInterviewSchema,
  updateInterviewSchema,
  updateStatusSchema,
  rescheduleSchema,
  outcomeSchema,
  cancelSchema,
  assignInterviewersSchema,
  queryInterviewsSchema,
} from "../validation";
import { paginationHelper } from "../../../shared/pagination/pagination.helper";

// Scoping company validations
function validateCompanyAccess(entityCompanyId: string, currentUser: AuthenticatedUser) {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (entityCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(INTERVIEW_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

function enforceWriterRole(currentUser: AuthenticatedUser) {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
  }
}

async function getInterviewAndValidateAccess(
  id: string,
  currentUser: AuthenticatedUser,
  tx?: Prisma.TransactionClient
) {
  const interview = await interviewRepository.findById(id, false, tx);
  if (!interview) {
    throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
  }
  validateCompanyAccess(interview.companyId, currentUser);

  // Recruiter rule: Recruiters can only modify interviews on applications assigned to them
  if (
    currentUser.role === Role.RECRUITER &&
    interview.application.assignedRecruiterId !== currentUser.id
  ) {
    throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  return interview;
}

function verifyNoImmutableFields(body: unknown) {
  const immutableFields = ["interviewCode", "companyId", "applicationId", "createdAt"];
  for (const field of immutableFields) {
    if (body && typeof body === "object" && field in body) {
      throw new ValidationError(INTERVIEW_MESSAGES.IMMUTABLE_FIELD_UPDATE);
    }
  }
}

function validateTimeInFuture(startTimeStr: string) {
  const start = new Date(startTimeStr);
  const now = new Date();

  // Prevent scheduling in the past
  if (start < now) {
    throw new ValidationError(INTERVIEW_MESSAGES.TIME_VALIDATION_ERROR);
  }
}

export const interviewService = {
  scheduleInterview: async (input: CreateInterviewInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createInterviewSchema.parse(input);
    validateTimeInFuture(parsedInput.startTime);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Verify parent Application exists, belongs to company, and is ACTIVE
        const application = await interviewRepository.findActiveApplication(
          parsedInput.applicationId,
          tx
        );
        if (!application) {
          throw new NotFoundError("Application not found");
        }
        if (application.companyId !== companyId) {
          throw new ForbiddenError(INTERVIEW_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
        }
        if (application.status !== "ACTIVE") {
          throw new ConflictError(INTERVIEW_MESSAGES.APPLICATION_NOT_ELIGIBLE);
        }

        // If recruiter, check they are the assigned recruiter
        if (
          currentUser.role === Role.RECRUITER &&
          application.assignedRecruiterId !== currentUser.id
        ) {
          throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_MODIFICATION);
        }

        // 2. Validate all interviewers belong to same company
        const interviewers = await interviewRepository.findUsersCompany(
          parsedInput.interviewers,
          tx
        );
        if (interviewers.length !== parsedInput.interviewers.length) {
          throw new UnprocessableEntityError("One or more assigned interviewers not found");
        }
        for (const interviewer of interviewers) {
          if (interviewer.companyId !== companyId) {
            throw new UnprocessableEntityError(
              "Assigned interviewers must belong to the same company"
            );
          }
          if (interviewer.role !== Role.RECRUITER && interviewer.role !== Role.COMPANY_ADMIN) {
            throw new UnprocessableEntityError(
              "Assigned interviewers must have recruiter or company admin roles"
            );
          }
        }

        // 3. Check for interviewer scheduling conflicts
        const conflict = await interviewRepository.findInterviewerConflicts(
          parsedInput.interviewers,
          new Date(parsedInput.scheduledDate),
          new Date(parsedInput.startTime),
          new Date(parsedInput.endTime),
          undefined,
          tx
        );
        if (conflict) {
          throw new ConflictError(INTERVIEW_MESSAGES.INTERVIEWER_CONFLICT);
        }

        // 4. Check for duplicate rounds
        const duplicateRound = await interviewRepository.findDuplicateActiveRound(
          parsedInput.applicationId,
          parsedInput.round,
          undefined,
          tx
        );
        if (duplicateRound) {
          throw new ConflictError(INTERVIEW_MESSAGES.DUPLICATE_ROUND);
        }

        // 5. Generate safe interview code
        const counter = await interviewRepository.incrementInterviewCounter(companyId, tx);
        const interviewCode = `INT-${String(counter).padStart(6, "0")}`;

        const interview = await interviewRepository.create(
          companyId,
          interviewCode,
          { ...parsedInput, createdBy: currentUser.id },
          parsedInput.interviewers,
          tx
        );

        // Automatically update pipeline stage if pipeline exists
        const pipeline = await tx.hiringPipeline.findFirst({
          where: { applicationId: parsedInput.applicationId, deletedAt: null },
        });

        if (pipeline && !pipeline.isCompleted) {
          let nextStage: PipelineStage = PipelineStage.TECHNICAL_INTERVIEW;
          if (parsedInput.round === "HR") {
            nextStage = PipelineStage.HR_INTERVIEW;
          } else if (parsedInput.round === "FINAL") {
            nextStage = PipelineStage.FINAL_INTERVIEW;
          } else if (parsedInput.round === "SCREENING") {
            nextStage = PipelineStage.SCREENING;
          }

          const orderMap: Record<string, number> = {
            APPLIED: 1,
            SCREENING: 2,
            SHORTLISTED: 3,
            HR_INTERVIEW: 4,
            TECHNICAL_INTERVIEW: 5,
            FINAL_INTERVIEW: 6,
            OFFER_PENDING: 7,
            OFFER_SENT: 8,
            OFFER_ACCEPTED: 9,
            HIRED: 10,
            REJECTED: 11,
            WITHDRAWN: 12,
          };
          const stageOrder = orderMap[nextStage] || 5;

          // Update pipeline stage
          await tx.hiringPipeline.update({
            where: { id: pipeline.id },
            data: {
              currentStage: nextStage,
              previousStage: pipeline.currentStage,
              stageOrder,
              stageChangedAt: new Date(),
            },
          });

          // Add to history
          await tx.pipelineHistory.create({
            data: {
              pipelineId: pipeline.id,
              fromStage: pipeline.currentStage,
              toStage: nextStage,
              movedById: currentUser.id,
              reason: "Interview Scheduled",
              comments: `Interview round ${parsedInput.round} scheduled automatically.`,
            },
          });

          // Add to timeline
          const timelineEvent = TimelineFactory.createEvent(
            PipelineTimelineEventType.INTERVIEW_SCHEDULED,
            {
              round: parsedInput.round,
            }
          );
          await tx.pipelineTimeline.create({
            data: {
              pipelineId: pipeline.id,
              eventType: timelineEvent.eventType,
              title: timelineEvent.title,
              description: timelineEvent.description,
              createdById: currentUser.id,
            },
          });
        }

        return interview;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Interview Scheduled", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interview Scheduled",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  listInterviews: async (query: InterviewQueryFilters, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const parsedQuery = queryInterviewsSchema.parse(query);

    // Recruiters can only view interviews assigned to their own applications
    if (currentUser.role === Role.RECRUITER) {
      parsedQuery.recruiterId = currentUser.id;
    }
    const { skip, take } = paginationHelper.getPrismaOptions({
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    const result = await interviewRepository.findMany(companyId, parsedQuery, skip, take);
    const meta = paginationHelper.createMeta(result.total, {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    return {
      data: result.data,
      meta,
    };
  },

  getInterviewById: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
    }
    const interview = await interviewRepository.findById(id);
    if (!interview) {
      throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
    }
    validateCompanyAccess(interview.companyId, currentUser);
    // Recruiters can only view interviews assigned to their own applications
    if (
      currentUser.role === Role.RECRUITER &&
      interview.application.assignedRecruiterId !== currentUser.id
    ) {
      throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
    }
    return interview;
  },

  updateInterview: async (
    id: string,
    input: UpdateInterviewInput,
    currentUser: AuthenticatedUser
  ) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = updateInterviewSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        if (
          interview.status === InterviewStatus.COMPLETED ||
          interview.status === InterviewStatus.CANCELLED ||
          interview.status === InterviewStatus.NO_SHOW
        ) {
          throw new UnprocessableEntityError("Cannot update interviews in terminal status");
        }



        return await interviewRepository.update(
          id,
          {
            mode: parsedInput.mode,
            meetingLink: parsedInput.meetingLink,
            location: parsedInput.location,
            notes: parsedInput.notes,
            updatedBy: currentUser.id,
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Interview Updated", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interview Updated",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  rescheduleInterview: async (
    id: string,
    input: RescheduleInterviewInput,
    currentUser: AuthenticatedUser
  ) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = rescheduleSchema.parse(input);
    validateTimeInFuture(parsedInput.startTime);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        if (
          interview.status === InterviewStatus.COMPLETED ||
          interview.status === InterviewStatus.CANCELLED ||
          interview.status === InterviewStatus.NO_SHOW
        ) {
          throw new UnprocessableEntityError("Cannot reschedule interviews in terminal status");
        }

        // Check conditional validations based on current mode
        if (interview.mode === InterviewMode.ONLINE && !parsedInput.meetingLink) {
          throw new ValidationError("ONLINE interview requires meetingLink");
        }
        if (interview.mode === InterviewMode.ONSITE && !parsedInput.location) {
          throw new ValidationError("ONSITE interview requires location");
        }

        // Check interviewer availability conflicts (excluding this interview)
        const interviewerIds = interview.interviewers.map(
          (i: { interviewerId: string }) => i.interviewerId
        );
        const conflict = await interviewRepository.findInterviewerConflicts(
          interviewerIds,
          new Date(parsedInput.scheduledDate),
          new Date(parsedInput.startTime),
          new Date(parsedInput.endTime),
          id,
          tx
        );
        if (conflict) {
          throw new ConflictError(INTERVIEW_MESSAGES.INTERVIEWER_CONFLICT);
        }

        return await interviewRepository.update(
          id,
          {
            scheduledDate: new Date(parsedInput.scheduledDate),
            startTime: new Date(parsedInput.startTime),
            endTime: new Date(parsedInput.endTime),
            timeZone: parsedInput.timeZone,
            meetingLink: parsedInput.meetingLink,
            location: parsedInput.location,
            notes: parsedInput.notes,
            updatedBy: currentUser.id,
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Interview Rescheduled", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interview Rescheduled",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  cancelInterview: async (
    id: string,
    input: CancelInterviewInput,
    currentUser: AuthenticatedUser
  ) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = cancelSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        const currentStatus = interview.status;
        const allowed = STATUS_TRANSITION_RULES[currentStatus as InterviewStatus] || [];
        if (!allowed.includes(InterviewStatus.CANCELLED)) {
          throw new UnprocessableEntityError(INTERVIEW_MESSAGES.INVALID_STATUS_TRANSITION);
        }

        return await interviewRepository.update(
          id,
          {
            status: InterviewStatus.CANCELLED,
            cancellationReason: parsedInput.cancellationReason,
            cancelledById: currentUser.id,
            cancelledAt: new Date(),
            updatedBy: currentUser.id,
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Interview Cancelled", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interview Cancelled",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  updateStatus: async (id: string, input: UpdateStatusInput, currentUser: AuthenticatedUser) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = updateStatusSchema.parse(input);

    return await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        const currentStatus = interview.status;
        const nextStatus = parsedInput.status;

        if (currentStatus === nextStatus) {
          return interview;
        }

        const allowed = STATUS_TRANSITION_RULES[currentStatus as InterviewStatus] || [];
        if (!allowed.includes(nextStatus)) {
          throw new UnprocessableEntityError(INTERVIEW_MESSAGES.INVALID_STATUS_TRANSITION);
        }

        const updated = await interviewRepository.update(
          id,
          {
            status: nextStatus,
            completedAt: nextStatus === InterviewStatus.COMPLETED ? new Date() : undefined,
            updatedBy: currentUser.id,
          },
          tx
        );

        // Create timeline event if COMPLETED
        if (nextStatus === InterviewStatus.COMPLETED) {
          const pipeline = await tx.hiringPipeline.findFirst({
            where: { applicationId: interview.applicationId, deletedAt: null },
          });
          if (pipeline && !pipeline.isCompleted) {
            const timelineEvent = TimelineFactory.createEvent(
              PipelineTimelineEventType.INTERVIEW_COMPLETED,
              {
                round: interview.round,
              }
            );
            await tx.pipelineTimeline.create({
              data: {
                pipelineId: pipeline.id,
                eventType: timelineEvent.eventType,
                title: timelineEvent.title,
                description: timelineEvent.description,
                createdById: currentUser.id,
              },
            });
          }
        }

        return updated;
      },
      {
        timeout: 20000,
      }
    );
  },

  recordOutcome: async (id: string, input: OutcomeInput, currentUser: AuthenticatedUser) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = outcomeSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        if (interview.status !== InterviewStatus.COMPLETED) {
          throw new UnprocessableEntityError(INTERVIEW_MESSAGES.OUTCOME_NOT_ALLOWED);
        }

        return await interviewRepository.update(
          id,
          {
            outcome: parsedInput.outcome,
            resultNotes: parsedInput.resultNotes,
            updatedBy: currentUser.id,
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Interview Outcome Recorded", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interview Outcome Recorded",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  assignInterviewers: async (
    id: string,
    input: AssignInterviewersInput,
    currentUser: AuthenticatedUser
  ) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = assignInterviewersSchema.parse(input);
    const companyId = currentUser.companyId!;

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const interview = await getInterviewAndValidateAccess(id, currentUser, tx);

        if (
          interview.status === InterviewStatus.COMPLETED ||
          interview.status === InterviewStatus.CANCELLED ||
          interview.status === InterviewStatus.NO_SHOW
        ) {
          throw new UnprocessableEntityError("Cannot modify interviewers on terminal interviews");
        }

        // Validate new interviewers belong to same company
        const interviewers = await interviewRepository.findUsersCompany(
          parsedInput.interviewers,
          tx
        );
        if (interviewers.length !== parsedInput.interviewers.length) {
          throw new UnprocessableEntityError("One or more assigned interviewers not found");
        }
        for (const interviewer of interviewers) {
          if (interviewer.companyId !== companyId) {
            throw new UnprocessableEntityError(
              "Assigned interviewers must belong to the same company"
            );
          }
          if (interviewer.role !== Role.RECRUITER && interviewer.role !== Role.COMPANY_ADMIN) {
            throw new UnprocessableEntityError(
              "Assigned interviewers must have recruiter or company admin roles"
            );
          }
        }

        // Check conflict for new list at current scheduled times
        const conflict = await interviewRepository.findInterviewerConflicts(
          parsedInput.interviewers,
          interview.scheduledDate,
          interview.startTime,
          interview.endTime,
          id,
          tx
        );
        if (conflict) {
          throw new ConflictError(INTERVIEW_MESSAGES.INTERVIEWER_CONFLICT);
        }

        return await interviewRepository.updateInterviewers(id, parsedInput.interviewers, tx);
      },
      {
        timeout: 20000,
      }
    );

    if (!result) {
      throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
    }

    logger.info("Interviewers Assigned", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interviewers Assigned",
      timestamp: new Date().toISOString(),
    });

    logger.info("Interviewers Updated", {
      interviewId: result.id,
      interviewCode: result.interviewCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Interviewers Updated",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  softDeleteInterview: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(INTERVIEW_MESSAGES.FORBIDDEN_ACCESS);
    }

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const interview = await interviewRepository.findById(id, false, tx);
      if (!interview) {
        throw new NotFoundError(INTERVIEW_MESSAGES.INTERVIEW_NOT_FOUND);
      }
      validateCompanyAccess(interview.companyId, currentUser);

      return await interviewRepository.softDelete(id, tx);
    });
  },
};
