import { randomBytes } from "crypto";
import { prisma } from "../../config/prisma";
import { hashPassword } from "../../shared/password";
import { ConflictError } from "../../shared/errors/ConflictError";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { CompanyOnboardingInput, CompanyOnboardingResult } from "./companies.types";
import { COMPANIES_MESSAGES } from "./companies.constants";
import { auditLogger } from "../../shared/logger/audit.logger";
import { AuthenticatedUser } from "../../shared/types";
import { safeCompanySelect } from "../../shared/prisma/selects/company.select";
import { safeUserSelect } from "../../shared/prisma/selects/user.select";
import { Role as PrismaRole, AccountStatus as PrismaAccountStatus } from "@prisma/client";

export const companyOnboardingService = {
  onboardCompany: async (
    input: CompanyOnboardingInput,
    currentUser: AuthenticatedUser
  ): Promise<CompanyOnboardingResult> => {

    // Execute all onboarding operations inside a single Prisma transaction
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Check uniqueness of Company Name inside transaction
        const existingCompany = await tx.company.findFirst({
          where: {
            name: {
              equals: input.company.name,
              mode: "insensitive",
            },
          },
        });

        if (existingCompany) {
          throw new ConflictError(COMPANIES_MESSAGES.COMPANY_ALREADY_EXISTS);
        }

        // 2. Check uniqueness of First Company Admin Email inside transaction
        const existingAdmin = await tx.user.findFirst({
          where: {
            email: {
              equals: input.admin.email,
              mode: "insensitive",
            },
          },
        });
        if (existingAdmin) {
          throw new ConflictError(COMPANIES_MESSAGES.ADMIN_EMAIL_ALREADY_EXISTS);
        }

        // 3. Generate secure temporary password inside transaction scope
        const randomHex = randomBytes(6).toString("hex");
        const tempPassword = `T3mp!${randomHex}$`;

        // 4. Hash password inside transaction scope
        const passwordHash = await hashPassword(tempPassword);

        // 5. Create company
        const company = await tx.company.create({
          data: {
            name: input.company.name,
            description: input.company.description,
            website: input.company.website,
            industry: input.company.industry,
            companySize: input.company.companySize,
            contactEmail: input.company.contactEmail,
            contactPhone: input.company.contactPhone,
            headquarters: input.company.headquarters,
            logoUrl: input.company.logoUrl,
            status: AccountStatus.ACTIVE as unknown as PrismaAccountStatus,
          },
          select: safeCompanySelect,
        });

        // 6. Create first company admin linked to this company
        const admin = await tx.user.create({
          data: {
            email: input.admin.email,
            name: input.admin.name || `${input.company.name} Admin`,
            password: passwordHash,
            role: Role.COMPANY_ADMIN as unknown as PrismaRole,
            status: AccountStatus.ACTIVE as unknown as PrismaAccountStatus,
            isVerified: true,
            mustChangePassword: true,
            companyId: company.id,
          },
          select: safeUserSelect,
        });

        return {
          company,
          admin,
          temporaryPassword: tempPassword,
        };
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    // 7. Audit Logging (executed after transaction commits successfully)
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "COMPANY_ONBOARDING",
      category: "COMPANY_MANAGEMENT",
      resourceId: result.company.id,
      resourceType: "COMPANY",
      description: `Onboarded new company ${result.company.name} (${result.company.id}) with first admin ${result.admin.email}`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: result.company.id,
        adminUserId: result.admin.id,
        timestamp: new Date().toISOString(),
      },
    });

    return result;
  },
};
