import { AccountStatus } from "../../shared/enums/status.enum";
import { SafeUser } from "../../shared/prisma/selects/user.select";
import { SafeCompany } from "../../shared/prisma/selects/company.select";

export { SafeCompany } from "../../shared/prisma/selects/company.select";

export interface CompanyQueryFilters {
  industry?: string;
  companySize?: string;
  isVerified?: boolean;
  status?: AccountStatus;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showDeleted?: boolean;
}

export interface CompanyOnboardingAdminInput {
  email: string;
  name?: string;
}

export interface CompanyOnboardingInput {
  company: {
    name: string;
    description?: string;
    website?: string;
    industry: string;
    companySize: string;
    email?: string;
    phone?: string;
    headquarters?: string;
    foundedYear?: number;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    logoUrl?: string;
    coverImage?: string;
  };
  admin: CompanyOnboardingAdminInput;
}

export interface CompanyOnboardingResult {
  company: SafeCompany;
  admin: SafeUser;
  temporaryPassword: string;
}
