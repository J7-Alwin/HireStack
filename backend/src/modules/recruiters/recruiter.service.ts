import { randomBytes } from "crypto";
import { recruiterRepository } from "./recruiter.repository";
import { departmentsRepository } from "../departments/departments.repository";
import { companiesRepository } from "../companies/companies.repository";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { hashPassword } from "../../shared/password";
import {
  RecruiterQueryFilters,
  RecruiterCreateInput,
  RecruiterUpdateInput,
  SafeUser,
} from "./recruiter.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { ConflictError } from "../../shared/errors/ConflictError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { UnprocessableEntityError } from "../../shared/errors/UnprocessableEntityError";
import { RECRUITERS_MESSAGES } from "./recruiter.constants";
import { Prisma } from "@prisma/client";

export const recruiterService = {
  createRecruiter: async (
    input: RecruiterCreateInput & { companyId?: string },
    currentUser: AuthenticatedUser
  ): Promise<{ recruiter: SafeUser; temporaryPassword: string }> => {
    // 1. Authorization check: SUPER_ADMIN or COMPANY_ADMIN only
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    // 2. Derive companyId
    let targetCompanyId: string;
    if (currentUser.role === Role.SUPER_ADMIN) {
      if (!input.companyId) {
        throw new ValidationError("companyId is required for SUPER_ADMIN");
      }
      targetCompanyId = input.companyId;
    } else {
      if (!currentUser.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_ACCESS);
      }
      targetCompanyId = currentUser.companyId;
    }

    // 3. Verify company exists
    const company = await companiesRepository.findById(targetCompanyId);
    if (!company) {
      throw new NotFoundError(RECRUITERS_MESSAGES.COMPANY_NOT_FOUND);
    }

    // 4. Validate department details
    const department = await departmentsRepository.findById(input.departmentId);
    if (!department) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }
    if (department.companyId !== targetCompanyId) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_COMPANY_MISMATCH);
    }
    if (!department.isActive) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_INACTIVE);
    }
    if (department.deletedAt) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_DELETED);
    }

    // 5. Verify email uniqueness globally (including deleted)
    const existingUser = await recruiterRepository.findUserByEmail(input.email, true);
    if (existingUser) {
      throw new ConflictError(RECRUITERS_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // 6. Generate temporary password
    const randomHex = randomBytes(6).toString("hex");
    const tempPassword = `T3mp!${randomHex}$`;

    // 7. Hash password
    const passwordHash = await hashPassword(tempPassword);

    // 8. Create user record with role = RECRUITER
    const recruiter = await recruiterRepository.create({
      email: input.email.trim().toLowerCase(),
      password: passwordHash,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      name: `${input.firstName.trim()} ${input.lastName.trim()}`,
      phone: input.phone?.trim() || null,
      avatar: input.avatar?.trim() || null,
      designation: input.designation.trim(),
      experience: input.experience || 0,
      role: Role.RECRUITER as unknown as "RECRUITER",
      status: AccountStatus.ACTIVE as unknown as "ACTIVE",
      isActive: true,
      isVerified: true,
      mustChangePassword: true,
      companyId: targetCompanyId,
      departmentId: input.departmentId,
    });

    return {
      recruiter,
      temporaryPassword: tempPassword,
    };
  },

  getRecruiterById: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const includeDeleted = currentUser.role === Role.SUPER_ADMIN;
    const recruiter = await recruiterRepository.findById(id, includeDeleted);

    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    return recruiter;
  },

  listRecruiters: async (
    filters: RecruiterQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeUser>> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const where: Prisma.UserWhereInput = {
      role: Role.RECRUITER as unknown as "RECRUITER",
    };

    // Tenant Isolation / Query parameter overrides
    if (currentUser.role === Role.SUPER_ADMIN) {
      if (filters.companyId) {
        where.companyId = filters.companyId;
      }
      if (!filters.showDeleted) {
        where.deletedAt = null;
      }
    } else {
      if (!currentUser.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_ACCESS);
      }
      where.companyId = currentUser.companyId;
      where.deletedAt = null; // Company Admins can never see soft-deleted
    }

    // Additional Filters
    if (filters.department) {
      where.departmentId = filters.department;
    }
    if (filters.designation) {
      where.designation = {
        equals: filters.designation.trim(),
        mode: "insensitive",
      };
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    // Search query partial matching on names, email, and designation
    if (filters.search) {
      const searchTrim = filters.search.trim();
      if (searchTrim) {
        where.OR = [
          { firstName: { contains: searchTrim, mode: "insensitive" } },
          { lastName: { contains: searchTrim, mode: "insensitive" } },
          { email: { contains: searchTrim, mode: "insensitive" } },
          { designation: { contains: searchTrim, mode: "insensitive" } },
        ];
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];

    if (sortBy === "name") {
      orderBy = [
        { firstName: sortOrder },
        { lastName: sortOrder },
      ];
    } else if (sortBy === "department") {
      orderBy = {
        department: {
          name: sortOrder,
        },
      };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    const { data, total } = await recruiterRepository.findMany({
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

  updateRecruiter: async (
    id: string,
    input: RecruiterUpdateInput,
    currentUser: AuthenticatedUser
  ): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {};

    // Validate department assignment if provided
    if (input.departmentId) {
      const department = await departmentsRepository.findById(input.departmentId);
      if (!department) {
        throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_NOT_FOUND);
      }
      if (department.companyId !== recruiter.companyId) {
        throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_COMPANY_MISMATCH);
      }
      if (!department.isActive) {
        throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_INACTIVE);
      }
      if (department.deletedAt) {
        throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_DELETED);
      }
      updateData.departmentId = input.departmentId;
    }

    // Handle updates for regular profile parameters
    if (input.firstName !== undefined) updateData.firstName = input.firstName.trim();
    if (input.lastName !== undefined) updateData.lastName = input.lastName.trim();
    if (input.phone !== undefined) updateData.phone = input.phone.trim() || null;
    if (input.designation !== undefined) updateData.designation = input.designation.trim();
    if (input.experience !== undefined) updateData.experience = input.experience;
    if (input.avatar !== undefined) updateData.avatar = input.avatar.trim() || null;

    // Derived Name update if either firstName or lastName is updated
    if (input.firstName !== undefined || input.lastName !== undefined) {
      const first = input.firstName !== undefined ? input.firstName.trim() : recruiter.firstName || "";
      const last = input.lastName !== undefined ? input.lastName.trim() : recruiter.lastName || "";
      updateData.name = `${first} ${last}`.trim();
    }

    return await recruiterRepository.update(id, updateData);
  },

  changeDepartment: async (
    id: string,
    departmentId: string,
    currentUser: AuthenticatedUser
  ): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    // Validate department
    const department = await departmentsRepository.findById(departmentId);
    if (!department) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_NOT_FOUND);
    }
    if (department.companyId !== recruiter.companyId) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_COMPANY_MISMATCH);
    }
    if (!department.isActive) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_INACTIVE);
    }
    if (department.deletedAt) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_DELETED);
    }

    return await recruiterRepository.update(id, { departmentId });
  },

  activateRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id, true);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    if (recruiter.deletedAt) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.ACTIVATE_DELETED_REJECTED);
    }

    // Verify company is active
    const company = await companiesRepository.findById(recruiter.companyId!);
    if (!company || company.status !== AccountStatus.ACTIVE) {
      throw new UnprocessableEntityError("Company is not active");
    }

    // Verify department is active if assigned
    if (recruiter.departmentId) {
      const department = await departmentsRepository.findById(recruiter.departmentId);
      if (!department || !department.isActive) {
        throw new UnprocessableEntityError("Department is not active");
      }
    }

    return await recruiterRepository.updateStatus(id, true);
  },

  deactivateRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    return await recruiterRepository.updateStatus(id, false);
  },

  softDeleteRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    const uniqueDeletedEmail = `${recruiter.email} (Deleted-${id})`;
    return await recruiterRepository.softDelete(id, uniqueDeletedEmail);
  },

  restoreRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await recruiterRepository.findById(id, true);
    if (!recruiter) {
      throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
    }

    // Tenant Isolation
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== recruiter.companyId) {
        throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
      }
    }

    if (!recruiter.deletedAt) {
      return recruiter;
    }

    // Parse the original email
    const originalEmail = recruiter.email.replace(` (Deleted-${id})`, "");

    // Verify email uniqueness before restoring
    const existing = await recruiterRepository.findUserByEmail(originalEmail, true);
    if (existing && existing.id !== id) {
      throw new ConflictError(RECRUITERS_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    return await recruiterRepository.restore(id, originalEmail);
  },
};
