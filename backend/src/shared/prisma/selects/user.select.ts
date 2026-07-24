import { Prisma } from "@prisma/client";

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatar: true,
  designation: true,
  experience: true,
  isActive: true,
  role: true,
  status: true,
  isVerified: true,
  companyId: true,
  departmentId: true,
  deletedAt: true,
  mustChangePassword: true,
  lastLoginAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof safeUserSelect }>;
