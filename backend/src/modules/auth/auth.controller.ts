import { Request, Response } from "express";
import { authService } from "./auth.service";
import { successResponse } from "../../shared/responses/success.response";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { AUTH_MESSAGES } from "./auth.constants";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const ipAddress = req.ip || undefined;
    const userAgent = (req.headers["user-agent"] as string) || undefined;

    const result = await authService.login(email, password, ipAddress, userAgent);

    res.status(HTTP_STATUS.OK).json(successResponse("Login successful", result));
  },

  logout: async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.LOGOUT_SUCCESS));
  },

  refreshToken: async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const ipAddress = req.ip || undefined;
    const userAgent = (req.headers["user-agent"] as string) || undefined;

    const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);

    res.status(HTTP_STATUS.OK).json(successResponse("Tokens rotated successfully", result));
  },

  changePassword: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Unauthenticated");
    }

    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.PASSWORD_CHANGED));
  },

  forgotPassword: async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.PASSWORD_RESET_REQUESTED));
  },

  resetPassword: async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.PASSWORD_RESET_COMPLETED));
  },

  verifyEmail: async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    await authService.verifyEmail(token);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.EMAIL_VERIFIED));
  },

  resendVerification: async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Unauthenticated");
    }

    await authService.resendVerification(userId);

    res.status(HTTP_STATUS.OK).json(successResponse(AUTH_MESSAGES.RESEND_VERIFICATION_SUCCESS));
  },

  getCurrentUser: async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedError("Unauthenticated");
    }

    res.status(HTTP_STATUS.OK).json(successResponse("Profile retrieved successfully", { user }));
  },
};
