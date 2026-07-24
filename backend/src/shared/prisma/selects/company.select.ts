import { Prisma } from "@prisma/client";

export const safeCompanySelect = {
  id: true,
  name: true,
  description: true,
  website: true,
  industry: true,
  companySize: true,
  logoUrl: true,
  contactEmail: true,
  contactPhone: true,
  headquarters: true,
  isVerified: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeCompany = Prisma.CompanyGetPayload<{ select: typeof safeCompanySelect }>;
