import { Role, ApplicationStage, ApplicationStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ForbiddenError, NotFoundError, ConflictError, UnprocessableEntityError } from "../../shared/errors";
import { AuthenticatedUser } from "../../shared/types";
import { APPLICATIONS_MESSAGES, STAGE_TRANSITION_RULES, STATUS_TRANSITION_RULES } from "./application.constants";
import { applicationRepository } from "./application.repository";
import {
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ApplicationAssignRecruiterInput,
  ApplicationUpdateStageInput,
  ApplicationUpdateStatusInput,
  ApplicationRejectInput,
  ApplicationWithdrawInput,
  ApplicationQueryFilters,
} from "./application.types";
import {
  createApplicationSchema,
  updateApplicationSchema,
  assignRecruiterSchema,
  updateStageSchema,
  updateStatusSchema,
  rejectApplicationSchema,
  withdrawApplicationSchema,
  queryApplicationsSchema,
} from "./application.validation";
import { paginationHelper } from "../../shared/pagination/pagination.helper";

// Enforce role-based access rules and company isolation
function validateCompanyAccess(entityCompanyId: string, currentUser: AuthenticatedUser) {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (entityCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(APPLICATIONS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

function enforceWriterRole(currentUser: AuthenticatedUser) {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
  }
}

async function getApplicationAndValidateAccess(id: string, currentUser: AuthenticatedUser) {
  const application = await applicationRepository.findById(id);
  if (!application) {
    throw new NotFoundError(APPLICATIONS_MESSAGES.APPLICATION_NOT_FOUND);
  }
  validateCompanyAccess(application.companyId, currentUser);

  // Recruiter restriction: Recruiters can only modify applications assigned to them
  if (currentUser.role === Role.RECRUITER && application.assignedRecruiterId !== currentUser.id) {
    throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_MODIFICATION);
  }

  return application;
}

export const applicationService = {
  createApplication: async (input: ApplicationCreateInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createApplicationSchema.parse(input);

    return await prisma.$transaction(async (tx) => {
      // 1. Verify candidate exists, belongs to same company, is not blacklisted, is not archived, and not soft-deleted
      const candidate = await applicationRepository.findCandidateById(parsedInput.candidateId, tx);
      if (!candidate || candidate.deletedAt !== null) {
        throw new NotFoundError(APPLICATIONS_MESSAGES.CANDIDATE_NOT_FOUND);
      }
      if (candidate.companyId !== companyId) {
        throw new ForbiddenError(APPLICATIONS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
      if (candidate.status === "BLACKLISTED") {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.CANDIDATE_BLACKLISTED);
      }
      if (candidate.status === "ARCHIVED") {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.CANDIDATE_ARCHIVED);
      }

      // 2. Verify job exists, belongs to same company, is open, and not soft-deleted
      const job = await applicationRepository.findJobById(parsedInput.jobId, tx);
      if (!job || job.deletedAt !== null) {
        throw new NotFoundError(APPLICATIONS_MESSAGES.JOB_NOT_FOUND);
      }
      if (job.companyId !== companyId) {
        throw new ForbiddenError(APPLICATIONS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
      if (job.status !== "OPEN") {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.JOB_NOT_OPEN);
      }

      // 3. Verify recruiter exists, belongs to same company, and has RECRUITER role
      const recruiter = await applicationRepository.findUserById(parsedInput.assignedRecruiterId, tx);
      if (!recruiter || recruiter.deletedAt !== null) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_NOT_FOUND);
      }
      if (recruiter.companyId !== companyId) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_COMPANY_MISMATCH);
      }
      if (recruiter.role !== Role.RECRUITER) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_ROLE_INVALID);
      }

      // Recruiter role check: Recruiter must assign to themselves
      if (currentUser.role === Role.RECRUITER && parsedInput.assignedRecruiterId !== currentUser.id) {
        throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_MODIFICATION);
      }

      // 4. Check for duplicate active applications
      const duplicate = await applicationRepository.findActiveApplication(companyId, parsedInput.candidateId, parsedInput.jobId, tx);
      if (duplicate) {
        throw new ConflictError(APPLICATIONS_MESSAGES.DUPLICATE_APPLICATION);
      }

      // 5. Generate safe application code
      const counter = await applicationRepository.incrementApplicationCounter(companyId, tx);
      const applicationCode = `APP-${String(counter).padStart(6, "0")}`;

      // 6. Create application
      return await applicationRepository.create(
        {
          applicationCode,
          companyId,
          candidateId: parsedInput.candidateId,
          jobId: parsedInput.jobId,
          assignedRecruiterId: parsedInput.assignedRecruiterId,
          stage: ApplicationStage.APPLIED,
          status: ApplicationStatus.ACTIVE,
          source: parsedInput.source || undefined,
          remarks: parsedInput.remarks || undefined,
          createdBy: currentUser.id,
        },
        tx
      );
    });
  },

  listApplications: async (query: ApplicationQueryFilters, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;

    const parsedQuery = queryApplicationsSchema.parse(query);

    const { skip, take } = paginationHelper.getPrismaOptions({
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    const result = await applicationRepository.findMany(companyId, parsedQuery, skip, take);
    const meta = paginationHelper.createMeta(result.total, {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    return {
      data: result.data,
      meta,
    };
  },

  getApplicationById: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
    }
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError(APPLICATIONS_MESSAGES.APPLICATION_NOT_FOUND);
    }
    validateCompanyAccess(application.companyId, currentUser);
    return application;
  },

  updateApplication: async (id: string, input: ApplicationUpdateInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const application = await getApplicationAndValidateAccess(id, currentUser);

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const parsedInput = updateApplicationSchema.parse(input);

    return await applicationRepository.update(id, {
      remarks: parsedInput.remarks,
      updatedBy: currentUser.id,
    });
  },

  assignRecruiter: async (id: string, input: ApplicationAssignRecruiterInput, currentUser: AuthenticatedUser) => {
    // Only Company Admin can assign/reassign recruiters
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;

    const application = await getApplicationAndValidateAccess(id, currentUser);

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const parsedInput = assignRecruiterSchema.parse(input);

    return await prisma.$transaction(async (tx) => {
      const recruiter = await applicationRepository.findUserById(parsedInput.assignedRecruiterId, tx);
      if (!recruiter || recruiter.deletedAt !== null) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_NOT_FOUND);
      }
      if (recruiter.companyId !== companyId) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_COMPANY_MISMATCH);
      }
      if (recruiter.role !== Role.RECRUITER) {
        throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.RECRUITER_ROLE_INVALID);
      }

      return await applicationRepository.update(
        id,
        {
          assignedRecruiterId: parsedInput.assignedRecruiterId,
          updatedBy: currentUser.id,
        },
        tx
      );
    });
  },

  updateStage: async (id: string, input: ApplicationUpdateStageInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const application = await getApplicationAndValidateAccess(id, currentUser);

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const parsedInput = updateStageSchema.parse(input);
    const currentStage = application.stage;
    const nextStage = parsedInput.stage;

    // Validate transition matrix
    const allowed = STAGE_TRANSITION_RULES[currentStage] || [];
    if (!allowed.includes(nextStage)) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.INVALID_STAGE_TRANSITION);
    }

    return await applicationRepository.update(id, {
      stage: nextStage,
      updatedBy: currentUser.id,
    });
  },

  updateStatus: async (id: string, input: ApplicationUpdateStatusInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const application = await getApplicationAndValidateAccess(id, currentUser);

    const parsedInput = updateStatusSchema.parse(input);
    const currentStatus = application.status;
    const nextStatus = parsedInput.status;

    if (currentStatus === nextStatus) {
      return application;
    }

    // Terminal states cannot transition back to ACTIVE
    if (currentStatus !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const allowed = STATUS_TRANSITION_RULES[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.INVALID_STATUS_TRANSITION);
    }

    return await applicationRepository.update(id, {
      status: nextStatus,
      updatedBy: currentUser.id,
    });
  },

  rejectApplication: async (id: string, input: ApplicationRejectInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const application = await getApplicationAndValidateAccess(id, currentUser);

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const parsedInput = rejectApplicationSchema.parse(input);

    return await applicationRepository.update(id, {
      status: ApplicationStatus.REJECTED,
      rejectionReasonCode: parsedInput.rejectionReasonCode,
      rejectionReasonNote: parsedInput.rejectionReasonNote,
      updatedBy: currentUser.id,
    });
  },

  withdrawApplication: async (id: string, input: ApplicationWithdrawInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const application = await getApplicationAndValidateAccess(id, currentUser);

    if (application.status !== ApplicationStatus.ACTIVE) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.TERMINAL_STATE_READONLY);
    }

    const parsedInput = withdrawApplicationSchema.parse(input);

    return await applicationRepository.update(id, {
      status: ApplicationStatus.WITHDRAWN,
      withdrawalReasonCode: parsedInput.withdrawalReasonCode,
      withdrawalReasonNote: parsedInput.withdrawalReasonNote,
      updatedBy: currentUser.id,
    });
  },

  softDeleteApplication: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
    }
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new NotFoundError(APPLICATIONS_MESSAGES.APPLICATION_NOT_FOUND);
    }
    validateCompanyAccess(application.companyId, currentUser);

    return await applicationRepository.softDelete(id);
  },

  restoreApplication: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(APPLICATIONS_MESSAGES.FORBIDDEN_ACCESS);
    }
    const application = await applicationRepository.findById(id, true);
    if (!application) {
      throw new NotFoundError(APPLICATIONS_MESSAGES.APPLICATION_NOT_FOUND);
    }
    validateCompanyAccess(application.companyId, currentUser);

    if (application.deletedAt === null) {
      throw new UnprocessableEntityError(APPLICATIONS_MESSAGES.CANNOT_RESTORE_ACTIVE);
    }

    return await applicationRepository.restore(id);
  },
};
