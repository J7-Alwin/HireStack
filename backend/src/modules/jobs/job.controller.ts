import { Request, Response } from "express";
import { jobService } from "./job.service";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { JOBS_MESSAGES } from "./job.constants";
import { JobQueryFilters, JobCreateInput, JobUpdateInput } from "./job.types";
import {
  createJobSchema,
  updateJobSchema,
  listJobsQuerySchema,
  jobIdParamSchema,
  assignRecruitersSchema,
  jobIdAndRecruiterIdParamSchema,
} from "./job.validation";

export const jobController = {
  createJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const parsedBody = createJobSchema.parse(req.body);
    const result = await jobService.createJob(parsedBody as unknown as JobCreateInput, currentUser);

    res.status(HTTP_STATUS.CREATED).json(successResponse(JOBS_MESSAGES.JOB_CREATED, result));
  },

  listJobs: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const parsedQuery = listJobsQuerySchema.parse(req.query);
    const result = await jobService.listJobs(
      parsedQuery as unknown as JobQueryFilters,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(paginationResponse(JOBS_MESSAGES.JOBS_RETRIEVED, result.data, result.meta));
  },

  getJobById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.getJobById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_RETRIEVED, result));
  },

  updateJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const parsedBody = updateJobSchema.parse(req.body);
    const result = await jobService.updateJob(
      id,
      parsedBody as unknown as JobUpdateInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_UPDATED, result));
  },

  publishJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.publishJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_PUBLISHED, result));
  },

  openJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.openJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_OPENED, result));
  },

  pauseJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.pauseJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_PAUSED, result));
  },

  reopenJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.reopenJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_REOPENED, result));
  },

  closeJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.closeJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_CLOSED, result));
  },

  archiveJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.archiveJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_ARCHIVED, result));
  },

  restoreJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.restoreJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_RESTORED, result));
  },

  softDeleteJob: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const result = await jobService.softDeleteJob(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.JOB_DELETED, result));
  },

  assignRecruiters: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id } = jobIdParamSchema.parse(req.params);
    const { recruiterIds } = assignRecruitersSchema.parse(req.body);
    const result = await jobService.assignRecruiters(id, recruiterIds, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.RECRUITERS_ASSIGNED, result));
  },

  removeRecruiter: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { id, recruiterId } = jobIdAndRecruiterIdParamSchema.parse(req.params);
    const result = await jobService.removeRecruiter(id, recruiterId, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(JOBS_MESSAGES.RECRUITER_REMOVED, result));
  },
};
