import { Role, PipelineStage, PipelineTimelineEventType, Prisma } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ConflictError, ForbiddenError, NotFoundError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { logger } from "../../../shared/logger/logger";
import { PIPELINE_MESSAGES, STAGE_ORDER, TERMINAL_STAGES } from "../constants/pipeline.constants";
import { pipelineRepository } from "../repositories/pipeline.repository";
import {
  CreatePipelineInput,
  MoveStageInput,
  AddNotesInput,
  PipelineQueryFilters,
} from "../types/pipeline.types";
import {
  createPipelineSchema,
  moveStageSchema,
  addNotesSchema,
  queryPipelineSchema,
} from "../validation/pipeline.validation";
import { paginationHelper } from "../../../shared/pagination/pagination.helper";
import {
  enforceWriterRole,
  enforceCompanyAdmin,
  ensurePipelineExists,
  ensurePipelineNotCompleted,
  validatePipelineAccess,
  validateStageTransition,
  validateCompanyAccess,
} from "./business-rules/pipeline-rules";
import { pipelineHooks } from "./pipeline.hooks";

export const pipelineService = {
  createPipeline: async (input: CreatePipelineInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const parsedInput = createPipelineSchema.parse(input);

    const application = await pipelineRepository.findApplicationDetails(parsedInput.applicationId);
    if (!application) {
      throw new NotFoundError("Parent application not found");
    }

    validateCompanyAccess(application.companyId, currentUser);

    const existing = await pipelineRepository.findPipelineByApplication(parsedInput.applicationId);
    if (existing) {
      throw new ConflictError(PIPELINE_MESSAGES.DUPLICATE_PIPELINE);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const pipeline = await pipelineRepository.createPipeline(
          application.companyId,
          application.candidateId,
          application.assignedRecruiterId,
          application.jobId,
          parsedInput,
          tx
        );

        // Create history record
        await pipelineRepository.createHistoryRecord(
          pipeline.id,
          null,
          PipelineStage.APPLIED,
          currentUser.id,
          "Application Submitted",
          parsedInput.notes || "Initial pipeline creation on submission",
          tx
        );

        // Create timeline event
        await pipelineRepository.createTimelineEvent(
          pipeline.id,
          PipelineTimelineEventType.APPLICATION_SUBMITTED,
          "Application Submitted",
          "The application has been successfully submitted and entered the hiring pipeline.",
          currentUser.id,
          tx
        );

        return pipeline;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Hiring Pipeline Created", {
      action: "Pipeline Created",
      pipelineId: result.id,
      applicationId: result.applicationId,
      companyId: result.companyId,
      recruiterId: result.recruiterId,
      userId: currentUser.id,
      status: result.currentStage,
      timestamp: new Date().toISOString(),
    });

    await pipelineHooks.onPipelineCreated(result, currentUser.id);

    return result;
  },

  moveStage: async (id: string, input: MoveStageInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const parsedInput = moveStageSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const pipeline = await pipelineRepository.findPipelineById(id, false, tx);
        if (!pipeline) {
          throw new NotFoundError(PIPELINE_MESSAGES.NOT_FOUND);
        }

        validatePipelineAccess(pipeline, currentUser);
        ensurePipelineNotCompleted(pipeline);

        if (parsedInput.isOverride) {
          enforceCompanyAdmin(currentUser);
        }

        validateStageTransition(pipeline.currentStage, parsedInput.toStage, parsedInput.isOverride);

        const nextStage = parsedInput.toStage;
        const isCompleted = TERMINAL_STAGES.includes(nextStage);
        const completedReason = isCompleted ? nextStage : null;

        const updated = await pipelineRepository.updatePipelineStage(
          id,
          {
            currentStage: nextStage,
            previousStage: pipeline.currentStage,
            stageOrder: STAGE_ORDER[nextStage],
            stageChangedAt: new Date(),
            isCompleted,
            completedReason,
          },
          tx
        );

        // Create history record
        await pipelineRepository.createHistoryRecord(
          id,
          pipeline.currentStage,
          nextStage,
          currentUser.id,
          parsedInput.isOverride ? "Stage Override" : "Stage Transition",
          parsedInput.comments || parsedInput.reason || "Manual stage movement",
          tx
        );

        // Map timeline event type
        let timelineEventType: PipelineTimelineEventType = PipelineTimelineEventType.STAGE_OVERRIDE;
        let title = `Moved to ${nextStage}`;
        let description = parsedInput.comments || `Candidate progressed to stage ${nextStage}`;

        if (parsedInput.isOverride) {
          timelineEventType = PipelineTimelineEventType.STAGE_OVERRIDE;
          title = `Stage Override to ${nextStage}`;
          description = `Admin stage override: ${parsedInput.reason}`;
        } else {
          switch (nextStage) {
            case PipelineStage.SCREENING:
              timelineEventType = PipelineTimelineEventType.CANDIDATE_SHORTLISTED;
              title = "Screening Commenced";
              description = "Candidate entered the screening stage.";
              break;
            case PipelineStage.SHORTLISTED:
              timelineEventType = PipelineTimelineEventType.CANDIDATE_SHORTLISTED;
              title = "Shortlisted";
              description = "Candidate has been shortlisted for interviews.";
              break;
            case PipelineStage.HR_INTERVIEW:
            case PipelineStage.TECHNICAL_INTERVIEW:
            case PipelineStage.FINAL_INTERVIEW:
              timelineEventType = PipelineTimelineEventType.INTERVIEW_SCHEDULED;
              title = "Interview Round Process";
              description = `Candidate entered ${nextStage} round.`;
              break;
            case PipelineStage.OFFER_PENDING:
              timelineEventType = PipelineTimelineEventType.OFFER_PENDING;
              title = "Offer Pending Approval";
              description = "Offer generation initiated and pending approval.";
              break;
            case PipelineStage.OFFER_SENT:
              timelineEventType = PipelineTimelineEventType.OFFER_SENT;
              title = "Offer Sent";
              description = "Offer letter has been sent to the candidate.";
              break;
            case PipelineStage.OFFER_ACCEPTED:
              timelineEventType = PipelineTimelineEventType.OFFER_ACCEPTED;
              title = "Offer Accepted";
              description = "Candidate has accepted the employment offer.";
              break;
            case PipelineStage.HIRED:
              timelineEventType = PipelineTimelineEventType.CANDIDATE_HIRED;
              title = "Candidate Hired";
              description = "Hiring process completed successfully. Candidate is hired.";
              break;
            case PipelineStage.REJECTED:
              timelineEventType = PipelineTimelineEventType.CANDIDATE_REJECTED;
              title = "Candidate Rejected";
              description =
                parsedInput.comments || "Candidate rejected during recruitment process.";
              break;
            case PipelineStage.WITHDRAWN:
              timelineEventType = PipelineTimelineEventType.CANDIDATE_WITHDRAWN;
              title = "Application Withdrawn";
              description = parsedInput.comments || "Candidate has withdrawn their application.";
              break;
          }
        }

        await pipelineRepository.createTimelineEvent(
          id,
          timelineEventType,
          title,
          description,
          currentUser.id,
          tx
        );

        return updated;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Pipeline Stage Changed", {
      action: parsedInput.isOverride ? "Stage Overridden" : "Stage Changed",
      pipelineId: result.id,
      applicationId: result.applicationId,
      companyId: result.companyId,
      recruiterId: result.recruiterId,
      userId: currentUser.id,
      previousStage: result.previousStage,
      currentStage: result.currentStage,
      timestamp: new Date().toISOString(),
    });

    await pipelineHooks.onStageMoved(
      result,
      result.previousStage,
      result.currentStage,
      currentUser.id
    );

    if (result.isCompleted) {
      await pipelineHooks.onPipelineCompleted(result, result.completedReason!, currentUser.id);
    }

    return result;
  },

  addNotes: async (id: string, input: AddNotesInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const parsedInput = addNotesSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const pipeline = await pipelineRepository.findPipelineById(id, false, tx);
        if (!pipeline) {
          throw new NotFoundError(PIPELINE_MESSAGES.NOT_FOUND);
        }

        validatePipelineAccess(pipeline, currentUser);
        ensurePipelineNotCompleted(pipeline);

        const updated = await pipelineRepository.addPipelineNotes(id, parsedInput.notes, tx);

        // Create timeline event
        await pipelineRepository.createTimelineEvent(
          id,
          PipelineTimelineEventType.RECRUITER_ADDED_NOTE,
          "Recruiter Note Added",
          parsedInput.notes,
          currentUser.id,
          tx
        );

        return updated;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Pipeline Note Added", {
      action: "Recruiter Added Note",
      pipelineId: result.id,
      applicationId: result.applicationId,
      companyId: result.companyId,
      recruiterId: result.recruiterId,
      userId: currentUser.id,
      status: result.currentStage,
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  getPipelineById: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
    }
    const pipeline = await ensurePipelineExists(id);
    validateCompanyAccess(pipeline.companyId, currentUser);
    return pipeline;
  },

  listPipelines: async (query: PipelineQueryFilters, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const parsedQuery = queryPipelineSchema.parse(query);

    const { skip, take } = paginationHelper.getPrismaOptions({
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    // If recruiter, enforce assigned filters
    if (currentUser.role === Role.RECRUITER) {
      parsedQuery.recruiterId = currentUser.id;
    }

    const result = await pipelineRepository.findPipelinesMany(companyId, parsedQuery, skip, take);
    const meta = paginationHelper.createMeta(result.total, {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    return {
      data: result.data,
      meta,
    };
  },

  getHistory: async (id: string, currentUser: AuthenticatedUser) => {
    const pipeline = await ensurePipelineExists(id);
    validateCompanyAccess(pipeline.companyId, currentUser);
    return await pipelineRepository.findHistoryByPipelineId(id);
  },

  getTimeline: async (id: string, currentUser: AuthenticatedUser) => {
    const pipeline = await ensurePipelineExists(id);
    validateCompanyAccess(pipeline.companyId, currentUser);
    return await pipelineRepository.findTimelineByPipelineId(id);
  },

  getDashboardSummary: async (currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(PIPELINE_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const recruiterId = currentUser.role === Role.RECRUITER ? currentUser.id : undefined;

    return await pipelineRepository.aggregateDashboardMetrics(companyId, recruiterId);
  },

  getCompanyDashboard: async (currentUser: AuthenticatedUser) => {
    enforceCompanyAdmin(currentUser);
    const companyId = currentUser.companyId!;
    return await pipelineRepository.aggregateDashboardMetrics(companyId);
  },

  getRecruiterDashboard: async (currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;
    return await pipelineRepository.aggregateDashboardMetrics(companyId, currentUser.id);
  },

  softDeletePipeline: async (id: string, currentUser: AuthenticatedUser) => {
    enforceCompanyAdmin(currentUser);

    return await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const pipeline = await pipelineRepository.findPipelineById(id, false, tx);
        if (!pipeline) {
          throw new NotFoundError(PIPELINE_MESSAGES.NOT_FOUND);
        }
        validateCompanyAccess(pipeline.companyId, currentUser);

        return await pipelineRepository.softDeletePipeline(id, tx);
      },
      {
        timeout: 20000,
      }
    );
  },
};
