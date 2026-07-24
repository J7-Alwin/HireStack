import { Prisma } from "@prisma/client";

export const safeCompanySelect = {
  id: true,
  name: true,
  description: true,
  website: true,
  industry: true,
  companySize: true,
  logoUrl: true,
  coverImage: true,
  email: true,
  phone: true,
  headquarters: true,
  foundedYear: true,
  linkedin: true,
  twitter: true,
  facebook: true,
  instagram: true,
  isVerified: true,
  status: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type SafeCompany = Prisma.CompanyGetPayload<{ select: typeof safeCompanySelect }>;
