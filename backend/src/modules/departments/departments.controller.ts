import { Request, Response } from "express";
import { departmentsService } from "./departments.service";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { DEPARTMENTS_MESSAGES } from "./departments.constants";
import {
  DepartmentQueryFilters,
  DepartmentCreateInput,
  DepartmentUpdateInput,
} from "./departments.types";

export const departmentsController = {
  createDepartment: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const input = req.body as DepartmentCreateInput & { companyId?: string };
    const department = await departmentsService.createDepartment(input, currentUser);

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse(DEPARTMENTS_MESSAGES.DEPARTMENT_CREATED, department));
  },

  listDepartments: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const filters = req.query as unknown as DepartmentQueryFilters;
    const result = await departmentsService.listDepartments(filters, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(
        paginationResponse(DEPARTMENTS_MESSAGES.DEPARTMENTS_RETRIEVED, result.data, result.meta)
      );
  },

  getDepartmentById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const department = await departmentsService.getDepartmentById(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(DEPARTMENTS_MESSAGES.DEPARTMENT_RETRIEVED, department));
  },

  updateDepartment: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const input = req.body as DepartmentUpdateInput;
    const department = await departmentsService.updateDepartment(id, input, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(DEPARTMENTS_MESSAGES.DEPARTMENT_UPDATED, department));
  },

  changeStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { isActive } = req.body as { isActive: boolean };
    const department = await departmentsService.changeDepartmentStatus(id, isActive, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(DEPARTMENTS_MESSAGES.STATUS_UPDATED, department));
  },

  softDelete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const department = await departmentsService.softDeleteDepartment(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(DEPARTMENTS_MESSAGES.DEPARTMENT_DELETED, department));
  },

  restore: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const department = await departmentsService.restoreDepartment(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse(DEPARTMENTS_MESSAGES.DEPARTMENT_RESTORED, department));
  },
};
