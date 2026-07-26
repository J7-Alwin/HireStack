import { departmentsRepository } from "./departments.repository";
import { companiesRepository } from "../companies/companies.repository";
import { Role } from "../../shared/enums/role.enum";
import {
  DepartmentQueryFilters,
  DepartmentCreateInput,
  DepartmentUpdateInput,
  SafeDepartment,
} from "./departments.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { UnprocessableEntityError } from "../../shared/errors/UnprocessableEntityError";
import { DEPARTMENTS_MESSAGES } from "./departments.constants";
import { auditLogger } from "../../shared/logger/audit.logger";
import { Prisma } from "@prisma/client";

export const departmentsService = {
  createDepartment: async (
    input: DepartmentCreateInput & { companyId?: string },
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // 1. Authorization check: only SUPER_ADMIN and COMPANY_ADMIN can create
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_ACCESS);
    }

    // 2. Determine target companyId
    let targetCompanyId: string;
    if (currentUser.role === Role.SUPER_ADMIN) {
      if (!input.companyId) {
        throw new ValidationError("companyId is required for SUPER_ADMIN");
      }
      targetCompanyId = input.companyId;
    } else {
      if (!currentUser.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_ACCESS);
      }
      targetCompanyId = currentUser.companyId;
    }

    // 3. Verify company exists
    const company = await companiesRepository.findById(targetCompanyId);
    if (!company) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.COMPANY_NOT_FOUND);
    }

    // 4. Case-insensitive duplicate name check
    const existing = await departmentsRepository.findByNameInCompany(targetCompanyId, input.name);
    if (existing) {
      throw new ConflictError(DEPARTMENTS_MESSAGES.DEPARTMENT_ALREADY_EXISTS);
    }

    // 5. Create
    const department = await departmentsRepository.create({
      name: input.name.trim(),
      description: input.description?.trim() || null,
      companyId: targetCompanyId,
      isActive: true,
    });

    // 6. Audit logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "CREATE_DEPARTMENT",
      category: "DEPARTMENT_MANAGEMENT",
      resourceId: department.id,
      resourceType: "DEPARTMENT",
      description: `Created department ${department.name} (${department.id}) for company ${targetCompanyId}`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId,
        timestamp: new Date().toISOString(),
      },
    });

    return department;
  },

  getDepartmentById: async (
    id: string,
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // Super Admins can fetch soft-deleted departments
    const includeDeleted = currentUser.role === Role.SUPER_ADMIN;
    const department = await departmentsRepository.findById(id, includeDeleted);

    if (!department) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role !== Role.SUPER_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== department.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    return department;
  },

  listDepartments: async (
    filters: DepartmentQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeDepartment>> => {
    const where: Prisma.DepartmentWhereInput = {};

    // Tenant Isolation & Filter overrides
    if (currentUser.role === Role.SUPER_ADMIN) {
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }
      if (!filters.showDeleted) {
        where.deletedAt = null;
      }
    } else {
      // Company Admin & Recruiter are isolated to their own company
      if (!currentUser.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_ACCESS);
      }
      where.companyId = currentUser.companyId;
      where.deletedAt = null; // non-Super Admins can never see soft-deleted
    }

    // Status filtering
    if (filters.status) {
      where.isActive = filters.status === "ACTIVE";
    }

    // Search query partial matching (case-insensitive)
    if (filters.search) {
      const searchTrim = filters.search.trim();
      if (searchTrim) {
        where.OR = [
          { name: { contains: searchTrim, mode: "insensitive" } },
          { description: { contains: searchTrim, mode: "insensitive" } },
        ];
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    const orderBy: Prisma.DepartmentOrderByWithRelationInput = { [sortBy]: sortOrder };

    const { data, total } = await departmentsRepository.findMany({
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

  updateDepartment: async (
    id: string,
    input: DepartmentUpdateInput,
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // 1. Authorization check
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const department = await departmentsRepository.findById(id);
    if (!department) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // 2. Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== department.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    const updateData: Prisma.DepartmentUpdateInput = {};

    // 3. Name update uniqueness validation
    if (input.name) {
      const trimmedName = input.name.trim();
      if (trimmedName.toLowerCase() !== department.name.toLowerCase()) {
        const existing = await departmentsRepository.findByNameInCompany(
          department.companyId,
          trimmedName
        );
        if (existing && existing.id !== id) {
          throw new ConflictError(DEPARTMENTS_MESSAGES.DEPARTMENT_ALREADY_EXISTS);
        }
      }
      updateData.name = trimmedName;
    }

    if (input.description !== undefined) {
      updateData.description = input.description?.trim() || null;
    }

    const updated = await departmentsRepository.update(id, updateData);

    // 4. Audit logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "UPDATE_DEPARTMENT",
      category: "DEPARTMENT_MANAGEMENT",
      resourceId: id,
      resourceType: "DEPARTMENT",
      description: `Updated department details for ${department.name} (${id})`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: department.companyId,
        timestamp: new Date().toISOString(),
      },
    });

    return updated;
  },

  changeDepartmentStatus: async (
    id: string,
    isActive: boolean,
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // 1. Authorization check
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const department = await departmentsRepository.findById(id);
    if (!department) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // 2. Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== department.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    const updated = await departmentsRepository.updateStatus(id, isActive);

    // 3. Audit logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: isActive ? "ACTIVATE_DEPARTMENT" : "DEACTIVATE_DEPARTMENT",
      category: "DEPARTMENT_MANAGEMENT",
      resourceId: id,
      resourceType: "DEPARTMENT",
      description: `${isActive ? "Activated" : "Deactivated"} department ${department.name} (${id})`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: department.companyId,
        timestamp: new Date().toISOString(),
      },
    });

    return updated;
  },

  softDeleteDepartment: async (
    id: string,
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // 1. Authorization check
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const department = await departmentsRepository.findById(id);
    if (!department) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // 2. Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== department.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    // 3. Future-proofing dependency checks (Recruiters & Jobs)
    const activeRecruitersCount = await departmentsRepository.countActiveRecruiters(id);
    if (activeRecruitersCount > 0) {
      throw new UnprocessableEntityError(DEPARTMENTS_MESSAGES.DELETE_PREVENTED_RECRUITERS);
    }

    const activeJobsCount = await departmentsRepository.countActiveJobs(id);
    if (activeJobsCount > 0) {
      throw new UnprocessableEntityError(DEPARTMENTS_MESSAGES.DELETE_PREVENTED_JOBS);
    }

    const uniqueDeletedName = `${department.name} (Deleted-${id})`;
    const deleted = await departmentsRepository.softDelete(id, uniqueDeletedName);

    // 4. Audit logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "SOFT_DELETE_DEPARTMENT",
      category: "DEPARTMENT_MANAGEMENT",
      resourceId: id,
      resourceType: "DEPARTMENT",
      description: `Soft-deleted department ${department.name} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: department.companyId,
        timestamp: new Date().toISOString(),
      },
    });

    return deleted;
  },

  restoreDepartment: async (
    id: string,
    currentUser: AuthenticatedUser
  ): Promise<SafeDepartment> => {
    // 1. Authorization check
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(DEPARTMENTS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    // Restores search deleted departments as well
    const department = await departmentsRepository.findById(id, true);
    if (!department) {
      throw new NotFoundError(DEPARTMENTS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }

    // 2. Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== department.companyId) {
        throw new ForbiddenError(DEPARTMENTS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    if (!department.deletedAt) {
      return department; // already restored
    }

    // 3. Verify company still exists
    const company = await companiesRepository.findById(department.companyId);
    if (!company) {
      throw new ConflictError(DEPARTMENTS_MESSAGES.COMPANY_NOT_FOUND);
    }

    // 4. Verify no name conflict inside the same company
    const originalName = department.name.replace(` (Deleted-${id})`, "");
    const duplicate = await departmentsRepository.findByNameInCompany(
      department.companyId,
      originalName
    );
    if (duplicate) {
      throw new ConflictError(DEPARTMENTS_MESSAGES.RESTORE_CONFLICT);
    }

    const restored = await departmentsRepository.restore(id, originalName);

    // 5. Audit logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "RESTORE_DEPARTMENT",
      category: "DEPARTMENT_MANAGEMENT",
      resourceId: id,
      resourceType: "DEPARTMENT",
      description: `Restored department ${department.name} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: department.companyId,
        timestamp: new Date().toISOString(),
      },
    });

    return restored;
  },
};
