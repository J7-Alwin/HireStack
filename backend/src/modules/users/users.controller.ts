import { Request, Response } from "express";
import { usersService } from "./users.service";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { USERS_MESSAGES } from "./users.constants";
import { UserQueryFilters } from "./users.types";
import { AccountStatus } from "../../shared/enums/status.enum";

export const usersController = {
  getMe: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const user = await usersService.getCurrentUser(currentUser.id);

    res.status(HTTP_STATUS.OK).json(successResponse(USERS_MESSAGES.USER_RETRIEVED, { user }));
  },

  getUserById: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const user = await usersService.getUserById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(USERS_MESSAGES.USER_RETRIEVED, { user }));
  },

  listUsers: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const filters = res.locals.query as UserQueryFilters;
    const result = await usersService.listUsers(filters, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(paginationResponse(USERS_MESSAGES.USERS_RETRIEVED, result.data, result.meta));
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: AccountStatus };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const user = await usersService.updateUserStatus(id, status, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(USERS_MESSAGES.STATUS_UPDATED, { user }));
  },

  softDelete: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const user = await usersService.softDeleteUser(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(USERS_MESSAGES.USER_DELETED, { user }));
  },

  restore: async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const currentUser = req.user;
    if (!currentUser) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const user = await usersService.restoreUser(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse(USERS_MESSAGES.USER_RESTORED, { user }));
  },
};
