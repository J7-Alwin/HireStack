import { Prisma } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  isVerified: true,
  companyId: true,
  deletedAt: true,
  mustChangePassword: true,
  lastLoginAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
