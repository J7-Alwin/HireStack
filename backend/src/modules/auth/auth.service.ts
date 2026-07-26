import { randomBytes, createHash } from "crypto";
import { authRepository } from "./auth.repository";
import { passwordService } from "./services/password.service";
import { tokenService } from "./services/token.service";
import { sessionService } from "./services/session.service";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { AccountStatus } from "../../shared/enums/status.enum";
import { Role } from "../../shared/enums/role.enum";
import { AUTH_MESSAGES } from "./auth.constants";
import { LoginResponseData } from "./auth.types";
import { logger } from "../../shared/logger/logger";

export const authService = {
  hashResetToken: (token: string): string => {
    return createHash("sha256").update(token).digest("hex");
  },

  login: async (
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponseData> => {
    const user = await authRepository.findByEmail(email);

    if (!user) {
      logger.warn(`Failed login attempt: Email not found (${email})`);
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordMatch = await passwordService.compare(password, user.password);
    if (!passwordMatch) {
      logger.warn(`Failed login attempt: Incorrect password for (${email})`);
      throw new UnauthorizedError(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    if (user.status === AccountStatus.SUSPENDED) {
      throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_SUSPENDED);
    }

    if (user.status === AccountStatus.INACTIVE) {
      throw new UnauthorizedError(AUTH_MESSAGES.ACCOUNT_INACTIVE);
    }

    if (!user.isVerified) {
      throw new UnauthorizedError(AUTH_MESSAGES.EMAIL_UNVERIFIED);
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role as unknown as Role,
      status: user.status as unknown as AccountStatus,
      companyId: null, // to be populated in future phases
      recruiterId: null,
    };

    const accessToken = tokenService.generateAccess(payload);
    const refreshToken = tokenService.generateRefresh(payload);

    // Create session in DB
    await sessionService.createSession(user.id, refreshToken, ipAddress, userAgent);

    // Update last login
    await authRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    logger.info(`User logged in successfully: ${user.email} (ID: ${user.id})`);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as unknown as Role,
        status: user.status as unknown as AccountStatus,
      },
      accessToken,
      refreshToken,
      mustChangePassword: user.mustChangePassword,
    };
  },

  logout: async (refreshToken: string): Promise<void> => {
    await sessionService.deleteSession(refreshToken);
    logger.info("User logged out successfully");
  },

  refreshToken: async (
    refreshToken: string,
    _ipAddress?: string,
    _userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
      const session = await sessionService.findSession(refreshToken);

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedError(AUTH_MESSAGES.SESSION_EXPIRED);
      }

      const user = await authRepository.findById(session.userId);
      if (!user || user.status !== AccountStatus.ACTIVE) {
        throw new UnauthorizedError(AUTH_MESSAGES.SESSION_EXPIRED);
      }

      // Rotate tokens
      const newTokens = tokenService.rotateTokens(refreshToken);

      // Rotate token hash in DB
      await sessionService.rotateSession(refreshToken, newTokens.refreshToken);

      logger.info(`Refresh token rotated for user (ID: ${user.id})`);

      return newTokens;
    } catch (error) {
      logger.warn("Failed refresh token attempt", error);
      throw new UnauthorizedError(AUTH_MESSAGES.SESSION_EXPIRED);
    }
  },

  changePassword: async (userId: string, currentPass: string, newPass: string): Promise<void> => {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const match = await passwordService.compare(currentPass, user.password);
    if (!match) {
      throw new ValidationError("Incorrect current password");
    }

    const hashed = await passwordService.hash(newPass);

    await authRepository.update(userId, {
      password: hashed,
      passwordChangedAt: new Date(),
      mustChangePassword: false,
    });

    // Revoke all sessions on all devices
    await sessionService.deleteUserSessions(userId);

    logger.info(`Password changed for user (ID: ${userId})`);
  },

  forgotPassword: async (email: string): Promise<void> => {
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Return success silently to prevent user enumeration
      logger.info(`Forgot password request for unknown email: ${email}`);
      return;
    }

    const token = randomBytes(32).toString("hex");
    const hashedToken = authService.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await authRepository.updateResetToken(user.id, hashedToken, expiresAt);

    // HiredStack verification link generation (returned or printed in console log in development)
    logger.info("Password reset token generated for user", { userId: user.id });
  },

  resetPassword: async (token: string, newPass: string): Promise<void> => {
    const hashedToken = authService.hashResetToken(token);
    const user = await authRepository.findByResetToken(hashedToken);

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new ValidationError("Invalid or expired password reset token");
    }

    const hashed = await passwordService.hash(newPass);

    await authRepository.update(user.id, {
      password: hashed,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
      passwordChangedAt: new Date(),
    });

    // Invalidate sessions
    await sessionService.deleteUserSessions(user.id);

    logger.info(`Password reset successfully for user (ID: ${user.id})`);
  },

  verifyEmail: async (token: string): Promise<void> => {
    const hashedToken = authService.hashResetToken(token);
    const user = await authRepository.findByVerificationToken(hashedToken);

    if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new ValidationError("Invalid or expired email verification token");
    }

    await authRepository.verifyUserEmail(user.id);

    logger.info(`Email verified successfully for user (ID: ${user.id})`);
  },

  resendVerification: async (userId: string): Promise<void> => {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isVerified) {
      throw new ValidationError("Email is already verified");
    }

    const token = randomBytes(32).toString("hex");
    const hashedToken = authService.hashResetToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    await authRepository.updateVerificationToken(user.id, hashedToken, expiresAt);

    logger.info("New email verification token generated for user", { userId: user.id });
  },
};
