import { prisma } from "../../config/prisma";
import { User, Prisma } from "@prisma/client";

export const authRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  findById: async (id: string): Promise<User | null> => {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  update: async (id: string, data: Prisma.UserUpdateInput): Promise<User> => {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  updateVerificationToken: async (
    id: string,
    tokenHash: string | null,
    expiresAt: Date | null
  ): Promise<User> => {
    return await prisma.user.update({
      where: { id },
      data: {
        emailVerificationToken: tokenHash,
        emailVerificationExpiresAt: expiresAt,
      },
    });
  },

  updateResetToken: async (
    id: string,
    tokenHash: string | null,
    expiresAt: Date | null
  ): Promise<User> => {
    return await prisma.user.update({
      where: { id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });
  },

  verifyUserEmail: async (id: string): Promise<User> => {
    return await prisma.user.update({
      where: { id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });
  },

  findByResetToken: async (token: string): Promise<User | null> => {
    return await prisma.user.findFirst({
      where: { passwordResetToken: token },
    });
  },

  findByVerificationToken: async (token: string): Promise<User | null> => {
    return await prisma.user.findFirst({
      where: { emailVerificationToken: token },
    });
  },
};
