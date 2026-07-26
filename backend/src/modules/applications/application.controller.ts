import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { APPLICATIONS_MESSAGES } from "./application.constants";
import { applicationService } from "./application.service";
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
import { applicationIdParamSchema } from "./application.validation";

export const applicationController = {
  createApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await applicationService.createApplication(
      req.body as ApplicationCreateInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_CREATED, result));
  },

  listApplications: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await applicationService.listApplications(
      req.query as unknown as ApplicationQueryFilters,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(
        paginationResponse(APPLICATIONS_MESSAGES.APPLICATIONS_RETRIEVED, result.data, result.meta)
      );
  },

  getApplicationById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.getApplicationById(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_RETRIEVED, result));
  },

  updateApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.updateApplication(
      id,
      req.body as ApplicationUpdateInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_UPDATED, result));
  },

  assignRecruiter: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.assignRecruiter(
      id,
      req.body as ApplicationAssignRecruiterInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.RECRUITER_ASSIGNED, result));
  },

  updateStage: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.updateStage(
      id,
      req.body as ApplicationUpdateStageInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_STAGE_UPDATED, result));
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.updateStatus(
      id,
      req.body as ApplicationUpdateStatusInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_STATUS_UPDATED, result));
  },

  rejectApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.rejectApplication(
      id,
      req.body as ApplicationRejectInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_REJECTED, result));
  },

  withdrawApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.withdrawApplication(
      id,
      req.body as ApplicationWithdrawInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_WITHDRAWN, result));
  },

  softDeleteApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.softDeleteApplication(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_DELETED, result));
  },

  restoreApplication: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = applicationIdParamSchema.parse(req.params);
    const result = await applicationService.restoreApplication(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(APPLICATIONS_MESSAGES.APPLICATION_RESTORED, result));
  },
};
