import { createHash } from "crypto";
import { prisma } from "../../../config/prisma";
import { Session } from "@prisma/client";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError";
import { AUTH_MESSAGES, getSessionExpiryDate } from "../auth.constants";

export const sessionService = {
  hashToken: (token: string): string => {
    return createHash("sha256").update(token).digest("hex");
  },

  createSession: async (
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string,
    expiresAt?: Date
  ): Promise<Session> => {
    const refreshTokenHash = sessionService.hashToken(token);
    const expiry = expiresAt || getSessionExpiryDate();

    return await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        ipAddress,
        userAgent,
        expiresAt: expiry,
      },
    });
  },

  findSession: async (token: string): Promise<Session | null> => {
    const refreshTokenHash = sessionService.hashToken(token);
    return await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
      },
    });
  },

  rotateSession: async (oldToken: string, newToken: string, expiresAt?: Date): Promise<Session> => {
    const oldHash = sessionService.hashToken(oldToken);
    const newHash = sessionService.hashToken(newToken);
    const expiry = expiresAt || getSessionExpiryDate();

    const session = await prisma.session.findFirst({
      where: { refreshTokenHash: oldHash, revokedAt: null },
    });

    if (!session) {
      throw new UnauthorizedError(AUTH_MESSAGES.SESSION_EXPIRED);
    }

    return await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newHash,
        expiresAt: expiry,
        lastUsedAt: new Date(),
      },
    });
  },

  deleteSession: async (token: string): Promise<void> => {
    const refreshTokenHash = sessionService.hashToken(token);
    const session = await prisma.session.findFirst({
      where: { refreshTokenHash },
    });
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
  },

  deleteUserSessions: async (userId: string): Promise<void> => {
    await prisma.session.deleteMany({
      where: { userId },
    });
  },

  revokeSession: async (token: string): Promise<Session | null> => {
    const refreshTokenHash = sessionService.hashToken(token);
    const session = await prisma.session.findFirst({
      where: { refreshTokenHash, revokedAt: null },
    });
    if (!session) return null;

    return await prisma.session.update({
      where: { id: session.id },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  updateLastUsed: async (token: string): Promise<Session | null> => {
    const refreshTokenHash = sessionService.hashToken(token);
    const session = await prisma.session.findFirst({
      where: { refreshTokenHash, revokedAt: null },
    });
    if (!session) return null;

    return await prisma.session.update({
      where: { id: session.id },
      data: {
        lastUsedAt: new Date(),
      },
    });
  },
};
