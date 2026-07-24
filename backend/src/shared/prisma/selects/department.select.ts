import { Prisma } from "@prisma/client";

export const safeDepartmentSelect = {
  id: true,
  companyId: true,
  name: true,
  description: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeDepartment = Prisma.DepartmentGetPayload<{ select: typeof safeDepartmentSelect }>;
