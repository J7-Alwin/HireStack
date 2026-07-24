import { Request, Response } from "express";
import { recruiterService } from "./recruiter.service";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { RECRUITERS_MESSAGES } from "./recruiter.constants";
import { RecruiterQueryFilters, RecruiterCreateInput, RecruiterUpdateInput } from "./recruiter.types";

export const recruiterController = {
  createRecruiter: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const input = req.body as RecruiterCreateInput & { companyId?: string };
    const { recruiter, temporaryPassword } = await recruiterService.createRecruiter(input, currentUser);

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_CREATED, { recruiter, temporaryPassword })
    );
  },

  listRecruiters: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const filters = req.query as unknown as RecruiterQueryFilters;
    const result = await recruiterService.listRecruiters(filters, currentUser);

    res.status(HTTP_STATUS.OK).json(
      paginationResponse(RECRUITERS_MESSAGES.RECRUITERS_RETRIEVED, result.data, result.meta)
    );
  },

  getRecruiterById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const recruiter = await recruiterService.getRecruiterById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_RETRIEVED, recruiter)
    );
  },

  updateRecruiter: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const input = req.body as RecruiterUpdateInput;
    const recruiter = await recruiterService.updateRecruiter(id, input, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_UPDATED, recruiter)
    );
  },

  changeDepartment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { departmentId } = req.body as { departmentId: string };
    const recruiter = await recruiterService.changeDepartment(id, departmentId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.DEPARTMENT_CHANGED, recruiter)
    );
  },

  activateRecruiter: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const recruiter = await recruiterService.activateRecruiter(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_ACTIVATED, recruiter)
    );
  },

  deactivateRecruiter: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const recruiter = await recruiterService.deactivateRecruiter(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_DEACTIVATED, recruiter)
    );
  },

  softDelete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const recruiter = await recruiterService.softDeleteRecruiter(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_DELETED, recruiter)
    );
  },

  restore: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const recruiter = await recruiterService.restoreRecruiter(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(RECRUITERS_MESSAGES.RECRUITER_RESTORED, recruiter)
    );
  },
};
