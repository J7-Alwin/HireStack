import { jobRepository } from "./job.repository";
import { departmentsRepository } from "../departments/departments.repository";
import { recruiterRepository } from "../recruiters/recruiter.repository";
import { Role, JobStatus, Visibility, Prisma } from "@prisma/client";
import { JobQueryFilters, JobCreateInput, JobUpdateInput, SafeJob } from "./job.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { UnprocessableEntityError } from "../../shared/errors/UnprocessableEntityError";
import { JOBS_MESSAGES } from "./job.constants";

const ALLOWED_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.DRAFT]: [JobStatus.PUBLISHED],
  [JobStatus.PUBLISHED]: [JobStatus.OPEN],
  [JobStatus.OPEN]: [JobStatus.PAUSED, JobStatus.CLOSED],
  [JobStatus.PAUSED]: [JobStatus.OPEN, JobStatus.CLOSED],
  [JobStatus.CLOSED]: [JobStatus.ARCHIVED],
  [JobStatus.ARCHIVED]: [],
};

// Module Helpers

function isRecruiterAssigned(job: SafeJob, userId: string): boolean {
  return job.recruiters.some((r) => r.recruiter.id === userId);
}

function validateJobOwnership(jobCompanyId: string, currentUser: AuthenticatedUser): void {
  if (!currentUser.companyId || currentUser.companyId !== jobCompanyId) {
    throw new ForbiddenError(JOBS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

async function validateDepartment(departmentId: string, companyId: string): Promise<void> {
  const department = await departmentsRepository.findById(departmentId);
  if (!department) {
    throw new UnprocessableEntityError(JOBS_MESSAGES.DEPARTMENT_NOT_FOUND);
  }
  if (department.companyId !== companyId) {
    throw new UnprocessableEntityError(JOBS_MESSAGES.DEPARTMENT_COMPANY_MISMATCH);
  }
  if (!department.isActive) {
    throw new UnprocessableEntityError(JOBS_MESSAGES.DEPARTMENT_INACTIVE);
  }
  if (department.deletedAt) {
    throw new UnprocessableEntityError(JOBS_MESSAGES.DEPARTMENT_DELETED);
  }
}

async function validateRecruiters(recruiterIds: string[], companyId: string): Promise<void> {
  for (const rId of recruiterIds) {
    const rec = await recruiterRepository.findById(rId);
    if (!rec) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.RECRUITER_NOT_FOUND);
    }
    if (rec.companyId !== companyId) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.RECRUITER_COMPANY_MISMATCH);
    }
    if (rec.role !== Role.RECRUITER) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.RECRUITER_ROLE_INVALID);
    }
  }
}

async function validateSkills(skillIds: string[]): Promise<void> {
  const foundSkillIds = await jobRepository.verifySkillsExist(skillIds);
  if (foundSkillIds.length !== skillIds.length) {
    throw new UnprocessableEntityError(JOBS_MESSAGES.SKILL_NOT_FOUND);
  }
}

async function validateJobExists(id: string, includeDeleted = false): Promise<SafeJob> {
  const job = await jobRepository.findById(id, includeDeleted);
  if (!job) {
    throw new NotFoundError(JOBS_MESSAGES.JOB_NOT_FOUND);
  }
  return job as unknown as SafeJob;
}

export const jobService = {
  createJob: async (input: JobCreateInput, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (!currentUser.companyId) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const companyId = currentUser.companyId;

    // Validate Department
    await validateDepartment(input.departmentId, companyId);

    // Validate Recruiters if provided
    if (input.recruiterIds && input.recruiterIds.length > 0) {
      await validateRecruiters(input.recruiterIds, companyId);
    }

    // Validate Skills if provided
    if (input.skillIds && input.skillIds.length > 0) {
      await validateSkills(input.skillIds);
    }

    // Generate unique jobCode
    let jobCode = "";
    let exists = true;
    while (exists) {
      const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      jobCode = `JOB-${suffix}`;
      const existingJob = await jobRepository.findByJobCode(jobCode, true);
      if (!existingJob) {
        exists = false;
      }
    }

    const createdJob = await jobRepository.create(
      {
        companyId,
        departmentId: input.departmentId,
        jobCode,
        title: input.title.trim(),
        description: input.description.trim(),
        responsibilities: input.responsibilities?.trim() || null,
        requirements: input.requirements?.trim() || null,
        benefits: input.benefits?.trim() || null,
        employmentType: input.employmentType,
        workplaceType: input.workplaceType,
        experienceMin: input.experienceMin !== undefined ? input.experienceMin : null,
        experienceMax: input.experienceMax !== undefined ? input.experienceMax : null,
        salaryMin: input.salaryMin !== undefined ? input.salaryMin : null,
        salaryMax: input.salaryMax !== undefined ? input.salaryMax : null,
        currency: input.currency?.trim() || null,
        location: input.location?.trim() || null,
        openings: input.openings,
        visibility: input.visibility || Visibility.PUBLIC,
        status: JobStatus.DRAFT,
        closingDate: input.closingDate ? new Date(input.closingDate) : null,
        createdBy: currentUser.id,
        isActive: true,
      },
      input.recruiterIds,
      input.skillIds
    );

    return createdJob as unknown as SafeJob;
  },

  getJobById: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);
    if (
      currentUser.role === Role.RECRUITER &&
      !isRecruiterAssigned(job, currentUser.id)
    ) {
      throw new ForbiddenError(
        JOBS_MESSAGES.FORBIDDEN_MODIFICATION
      );
    }

    return job;
  },

  listJobs: async (
    filters: JobQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeJob>> => {
    if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (!currentUser.companyId) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const companyId = currentUser.companyId;

    const where: Prisma.JobWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (currentUser.role === Role.RECRUITER) {
      where.recruiters = {
        some: {
          recruiterId: currentUser.id,
        },
      };
    }

    if (filters.department) {
      where.departmentId = filters.department;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.employmentType) {
      where.employmentType = filters.employmentType;
    }
    if (filters.workplaceType) {
      where.workplaceType = filters.workplaceType;
    }
    if (filters.recruiter) {
      where.recruiters = {
        some: {
          recruiterId: filters.recruiter,
        },
      };
    }
    if (filters.createdDate) {
      where.createdAt = {
        gte: new Date(filters.createdDate),
      };
    }
    if (filters.closingDate) {
      where.closingDate = {
        lte: new Date(filters.closingDate),
      };
    }

    if (filters.search) {
      const searchTrim = filters.search.trim();
      if (searchTrim) {
        where.OR = [
          { title: { contains: searchTrim, mode: "insensitive" } },
          { jobCode: { contains: searchTrim, mode: "insensitive" } },
        ];
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    const orderBy: Prisma.JobOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const { data, total } = await jobRepository.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data: data as unknown as SafeJob[],
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateJob: async (
    id: string,
    input: JobUpdateInput,
    currentUser: AuthenticatedUser
  ): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
      // Recruiters are not allowed to change recruiter assignments
      if (input.recruiterIds !== undefined) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (job.status === JobStatus.ARCHIVED) {
      throw new ForbiddenError(JOBS_MESSAGES.ARCHIVED_JOB_READONLY);
    }

    const companyId = job.companyId;

    // Validate Department if updating
    if (input.departmentId) {
      await validateDepartment(input.departmentId, companyId);
    }

    // Validate Recruiters if updating
    if (input.recruiterIds && input.recruiterIds.length > 0) {
      await validateRecruiters(input.recruiterIds, companyId);
    }

    // Validate Skills if updating
    if (input.skillIds && input.skillIds.length > 0) {
      await validateSkills(input.skillIds);
    }

    const updatedJob = await jobRepository.update(
      id,
      {
        title: input.title !== undefined ? input.title.trim() : undefined,
        description: input.description !== undefined ? input.description.trim() : undefined,
        responsibilities:
          input.responsibilities !== undefined ? input.responsibilities.trim() || null : undefined,
        requirements:
          input.requirements !== undefined ? input.requirements.trim() || null : undefined,
        benefits: input.benefits !== undefined ? input.benefits.trim() || null : undefined,
        departmentId: input.departmentId,
        employmentType: input.employmentType,
        workplaceType: input.workplaceType,
        experienceMin: input.experienceMin !== undefined ? input.experienceMin : undefined,
        experienceMax: input.experienceMax !== undefined ? input.experienceMax : undefined,
        salaryMin: input.salaryMin !== undefined ? input.salaryMin : undefined,
        salaryMax: input.salaryMax !== undefined ? input.salaryMax : undefined,
        currency: input.currency !== undefined ? input.currency.trim() || null : undefined,
        location: input.location !== undefined ? input.location.trim() || null : undefined,
        openings: input.openings,
        visibility: input.visibility,
        closingDate: input.closingDate ? new Date(input.closingDate) : undefined,
      },
      input.recruiterIds,
      input.skillIds,
      currentUser.id
    );

    return updatedJob as unknown as SafeJob;
  },

  publishJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (job.status !== JobStatus.DRAFT) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus: job.status,
        targetStatus: JobStatus.PUBLISHED,
      });
    }

    // Publish validation
    if (
      !job.title ||
      !job.description ||
      !job.employmentType ||
      !job.workplaceType ||
      !job.departmentId ||
      job.openings <= 0 ||
      job.recruiters.length === 0
    ) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.PUBLISH_VALIDATION_FAILED);
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    return updatedJob as unknown as SafeJob;
  },

  openJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const currentStatus = job.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(JobStatus.OPEN)) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus,
        targetStatus: JobStatus.OPEN,
      });
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.OPEN,
    });

    return updatedJob as unknown as SafeJob;
  },

  pauseJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const currentStatus = job.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(JobStatus.PAUSED)) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus,
        targetStatus: JobStatus.PAUSED,
      });
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.PAUSED,
    });

    return updatedJob as unknown as SafeJob;
  },

  reopenJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    // Reopen is PAUSED -> OPEN
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (job.status !== JobStatus.PAUSED) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus: job.status,
        targetStatus: JobStatus.OPEN,
      });
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.OPEN,
    });

    return updatedJob as unknown as SafeJob;
  },

  closeJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const currentStatus = job.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(JobStatus.CLOSED)) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus,
        targetStatus: JobStatus.CLOSED,
      });
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.CLOSED,
    });

    return updatedJob as unknown as SafeJob;
  },

  archiveJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (currentUser.role === Role.RECRUITER) {
      if (!isRecruiterAssigned(job, currentUser.id)) {
        throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    } else if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const currentStatus = job.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowed.includes(JobStatus.ARCHIVED)) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.INVALID_LIFECYCLE_TRANSITION, {
        currentStatus,
        targetStatus: JobStatus.ARCHIVED,
      });
    }

    const updatedJob = await jobRepository.update(id, {
      status: JobStatus.ARCHIVED,
      archivedAt: new Date(),
    });

    return updatedJob as unknown as SafeJob;
  },

  restoreJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const job = await validateJobExists(id, true);
    validateJobOwnership(job.companyId, currentUser);

    if (!job.deletedAt) {
      throw new ConflictError(JOBS_MESSAGES.CANNOT_RESTORE_ACTIVE);
    }

    const restoredJob = await jobRepository.restore(id);
    return restoredJob as unknown as SafeJob;
  },

  softDeleteJob: async (id: string, currentUser: AuthenticatedUser): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    const deletedJob = await jobRepository.softDelete(id);
    return deletedJob as unknown as SafeJob;
  },

  assignRecruiters: async (
    id: string,
    recruiterIds: string[],
    currentUser: AuthenticatedUser
  ): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (job.status === JobStatus.ARCHIVED) {
      throw new ForbiddenError(JOBS_MESSAGES.ARCHIVED_JOB_READONLY);
    }

    // Validate recruiters belong to company and have role RECRUITER
    await validateRecruiters(recruiterIds, job.companyId);

    const updatedJob = await jobRepository.assignRecruiters(id, recruiterIds, currentUser.id);
    return updatedJob as unknown as SafeJob;
  },

  removeRecruiter: async (
    id: string,
    recruiterId: string,
    currentUser: AuthenticatedUser
  ): Promise<SafeJob> => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(JOBS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const job = await validateJobExists(id);
    validateJobOwnership(job.companyId, currentUser);

    if (job.status === JobStatus.ARCHIVED) {
      throw new ForbiddenError(JOBS_MESSAGES.ARCHIVED_JOB_READONLY);
    }

    const isAssigned = job.recruiters.some((r) => r.recruiter.id === recruiterId);
    if (!isAssigned) {
      throw new UnprocessableEntityError(JOBS_MESSAGES.RECRUITER_NOT_ASSIGNED);
    }

    const updatedJob = await jobRepository.removeRecruiter(id, recruiterId);
    return updatedJob as unknown as SafeJob;
  },
};
