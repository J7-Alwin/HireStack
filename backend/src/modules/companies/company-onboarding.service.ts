import { randomBytes } from "crypto";
import { companiesRepository } from "./companies.repository";
import { usersRepository } from "../users/users.repository";
import { hashPassword } from "../../shared/password";
import { ConflictError } from "../../shared/errors/ConflictError";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { CompanyOnboardingInput, CompanyOnboardingResult } from "./companies.types";
import { Role as PrismaRole, AccountStatus as PrismaAccountStatus } from "@prisma/client";
import { COMPANIES_MESSAGES } from "./companies.constants";
import { auditLogger } from "../../shared/logger/audit.logger";
import { AuthenticatedUser } from "../../shared/types";

export const companyOnboardingService = {
  onboardCompany: async (
    input: CompanyOnboardingInput,
    currentUser: AuthenticatedUser
  ): Promise<CompanyOnboardingResult> => {
    // 1. Check uniqueness of Company Name
    const existingCompany = await companiesRepository.findByName(input.company.name, true);
    if (existingCompany) {
      throw new ConflictError(COMPANIES_MESSAGES.COMPANY_ALREADY_EXISTS);
    }

    // 2. Check uniqueness of First Company Admin Email
    const existingAdmin = await usersRepository.findByEmail(input.admin.email, true);
    if (existingAdmin) {
      throw new ConflictError(COMPANIES_MESSAGES.ADMIN_EMAIL_ALREADY_EXISTS);
    }

    // 3. Generate secure temporary password
    const randomHex = randomBytes(6).toString("hex");
    const tempPassword = `T3mp!${randomHex}$`;

    // 4. Hash password
    const passwordHash = await hashPassword(tempPassword);

    // 5. Execute onboarding transaction
    const { company, admin } = await companiesRepository.onboardCompany(
      {
        name: input.company.name,
        description: input.company.description,
        website: input.company.website,
        industry: input.company.industry,
        companySize: input.company.companySize,
        email: input.company.email,
        phone: input.company.phone,
        headquarters: input.company.headquarters,
        foundedYear: input.company.foundedYear,
        linkedin: input.company.linkedin,
        twitter: input.company.twitter,
        facebook: input.company.facebook,
        instagram: input.company.instagram,
        logoUrl: input.company.logoUrl,
        coverImage: input.company.coverImage,
        status: AccountStatus.ACTIVE as unknown as PrismaAccountStatus,
      },
      {
        email: input.admin.email,
        name: input.admin.name || `${input.company.name} Admin`,
        password: passwordHash,
        role: Role.COMPANY_ADMIN as unknown as PrismaRole,
        status: AccountStatus.ACTIVE as unknown as PrismaAccountStatus,
        isVerified: true,
        mustChangePassword: true,
      }
    );

    // 6. Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "COMPANY_ONBOARDING",
      category: "COMPANY_MANAGEMENT",
      resourceId: company.id,
      resourceType: "COMPANY",
      description: `Onboarded new company ${company.name} (${company.id}) with first admin ${admin.email}`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: company.id,
        adminUserId: admin.id,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      company,
      admin,
      temporaryPassword: tempPassword,
    };
  },
};
