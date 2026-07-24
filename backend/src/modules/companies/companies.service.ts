import { companiesRepository } from "./companies.repository";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { CompanyQueryFilters, SafeCompany } from "./companies.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { auditLogger } from "../../shared/logger/audit.logger";
import { COMPANIES_MESSAGES } from "./companies.constants";
import { Prisma } from "@prisma/client";

export const companiesService = {
  getCompanyById: async (id: string, currentUser: AuthenticatedUser): Promise<SafeCompany> => {
    // Determine if we should search deleted (Super Admin only)
    const includeDeleted = currentUser.role === Role.SUPER_ADMIN;
    const company = await companiesRepository.findById(id, includeDeleted);

    if (!company) {
      throw new NotFoundError(COMPANIES_MESSAGES.COMPANY_NOT_FOUND);
    }

    // Role-based authorization & Company Isolation checks
    if (currentUser.role === Role.SUPER_ADMIN) {
      return company;
    }

    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== company.id) {
        throw new ForbiddenError(COMPANIES_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }
      return company;
    }

    throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_ACCESS);
  },

  listCompanies: async (
    filters: CompanyQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeCompany>> => {
    // Only Super Admin can list companies
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_ACCESS);
    }

    const where: Prisma.CompanyWhereInput = {};

    // Soft delete filtering
    if (!filters.showDeleted) {
      where.deletedAt = null;
    }

    // Filters
    if (filters.industry) {
      where.industry = filters.industry;
    }
    if (filters.companySize) {
      where.companySize = filters.companySize;
    }
    if (filters.isVerified !== undefined) {
      where.isVerified = filters.isVerified;
    }
    if (filters.status) {
      where.status = filters.status as unknown as Prisma.EnumAccountStatusFilter;
    }

    // Search query matching
    if (filters.search) {
      const searchLower = filters.search.trim();
      if (searchLower) {
        const orConditions: Prisma.CompanyWhereInput[] = [
          { name: { contains: searchLower, mode: "insensitive" } },
          { industry: { contains: searchLower, mode: "insensitive" } },
          { website: { contains: searchLower, mode: "insensitive" } },
          { email: { contains: searchLower, mode: "insensitive" } },
        ];

        // Check if search matches AccountStatus enum
        const matchedStatus = Object.values(AccountStatus).find(
          (s) => s.toLowerCase() === searchLower.toLowerCase()
        );
        if (matchedStatus) {
          orConditions.push({ status: matchedStatus as unknown as Prisma.EnumAccountStatusFilter });
        }

        where.OR = orConditions;
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    const orderBy: Prisma.CompanyOrderByWithRelationInput = { [sortBy]: sortOrder };

    const { data, total } = await companiesRepository.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  updateCompany: async (
    id: string,
    data: Partial<Prisma.CompanyUpdateInput>,
    currentUser: AuthenticatedUser
  ): Promise<SafeCompany> => {
    // Check permission: Super Admin or Company Admin of the same company
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_ACCESS);
    }

    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== id) {
        throw new ForbiddenError(COMPANIES_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }
    }

    // Verify company exists
    const company = await companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundError(COMPANIES_MESSAGES.COMPANY_NOT_FOUND);
    }

    // Check unique company name if changing name
    if (data.name && typeof data.name === "string" && data.name !== company.name) {
      const existingCompany = await companiesRepository.findByName(data.name);
      if (existingCompany && existingCompany.id !== id) {
        throw new ConflictError(COMPANIES_MESSAGES.COMPANY_ALREADY_EXISTS);
      }
    }

    const updatedCompany = await companiesRepository.update(id, data);

    // Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "UPDATE_COMPANY",
      category: "COMPANY_MANAGEMENT",
      resourceId: id,
      resourceType: "COMPANY",
      description: `Updated company profile details for ${company.name}`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: id,
        timestamp: new Date().toISOString(),
      },
    });

    return updatedCompany;
  },

  updateCompanyStatus: async (
    id: string,
    status: AccountStatus,
    currentUser: AuthenticatedUser
  ): Promise<SafeCompany> => {
    // Only Super Admin can change company status
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_STATUS_UPDATE);
    }

    const company = await companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundError(COMPANIES_MESSAGES.COMPANY_NOT_FOUND);
    }

    const updatedCompany = await companiesRepository.updateStatus(id, status);

    // Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "UPDATE_COMPANY_STATUS",
      category: "COMPANY_MANAGEMENT",
      resourceId: id,
      resourceType: "COMPANY",
      description: `Updated company status for ${company.name} (${id}) to ${status}`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: id,
        oldStatus: company.status,
        newStatus: status,
        timestamp: new Date().toISOString(),
      },
    });

    return updatedCompany;
  },

  softDeleteCompany: async (id: string, currentUser: AuthenticatedUser): Promise<SafeCompany> => {
    // Only Super Admin can delete companies
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_DELETE);
    }

    const company = await companiesRepository.findById(id);
    if (!company) {
      throw new NotFoundError(COMPANIES_MESSAGES.COMPANY_NOT_FOUND);
    }

    const deletedCompany = await companiesRepository.softDelete(id);

    // Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "SOFT_DELETE_COMPANY",
      category: "COMPANY_MANAGEMENT",
      resourceId: id,
      resourceType: "COMPANY",
      description: `Soft deleted company ${company.name} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: id,
        timestamp: new Date().toISOString(),
      },
    });

    return deletedCompany;
  },

  restoreCompany: async (id: string, currentUser: AuthenticatedUser): Promise<SafeCompany> => {
    // Only Super Admin can restore companies
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(COMPANIES_MESSAGES.FORBIDDEN_RESTORE);
    }

    // Must fetch including deleted
    const company = await companiesRepository.findById(id, true);
    if (!company) {
      throw new NotFoundError(COMPANIES_MESSAGES.COMPANY_NOT_FOUND);
    }

    if (!company.deletedAt) {
      // Not deleted, return as is
      return company;
    }

    const restoredCompany = await companiesRepository.restore(id);

    // Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "RESTORE_COMPANY",
      category: "COMPANY_MANAGEMENT",
      resourceId: id,
      resourceType: "COMPANY",
      description: `Restored company ${company.name} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: id,
        timestamp: new Date().toISOString(),
      },
    });

    return restoredCompany;
  },
};
