import { recruiterRepository } from "./recruiter.repository";
import { departmentsRepository } from "../departments/departments.repository";
import { companiesRepository } from "../companies/companies.repository";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { hashPassword, passwordHelper } from "../../shared/password";
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
import { UnprocessableEntityError } from "../../shared/errors/UnprocessableEntityError";
import { RECRUITERS_MESSAGES } from "./recruiter.constants";
import { ValidationError } from "../../shared/errors/ValidationError";
import { Prisma } from "@prisma/client";

// Private module helpers

async function validateDepartment(departmentId: string, companyId: string): Promise<void> {
  const department = await departmentsRepository.findById(departmentId);
  if (!department) {
    throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_NOT_FOUND);
  }
  if (department.companyId !== companyId) {
    throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_COMPANY_MISMATCH);
  }
  if (!department.isActive) {
    throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_INACTIVE);
  }
  if (department.deletedAt) {
    throw new UnprocessableEntityError(RECRUITERS_MESSAGES.DEPARTMENT_DELETED);
  }
}

function validateRecruiterOwnership(
  recruiterCompanyId: string | null,
  currentUser: AuthenticatedUser
): void {
  if (!currentUser.companyId || currentUser.companyId !== recruiterCompanyId) {
    throw new ForbiddenError(RECRUITERS_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

async function validateRecruiterExists(id: string, includeDeleted = false): Promise<SafeUser> {
  const recruiter = await recruiterRepository.findById(id, includeDeleted);
  if (!recruiter) {
    throw new NotFoundError(RECRUITERS_MESSAGES.RECRUITER_NOT_FOUND);
  }
  return recruiter;
}

async function createRecruiterUser(
  input: RecruiterCreateInput,
  companyId: string,
  tempPasswordHash: string
): Promise<SafeUser> {
  return await recruiterRepository.create({
    email: input.email.trim().toLowerCase(),
    password: tempPasswordHash,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    phone: input.phone?.trim() || null,
    avatar: input.avatar?.trim() || null,
    designation: input.designation.trim(),
    experience: input.experience || 0,
    role: Role.RECRUITER as unknown as "RECRUITER",
    isActive: true,
    isVerified: true,
    mustChangePassword: true,
    companyId,
    departmentId: input.departmentId,
  });
}

export const recruiterService = {
  createRecruiter: async (
    input: RecruiterCreateInput,
    currentUser: AuthenticatedUser
  ): Promise<{ recruiter: SafeUser; temporaryPassword: string }> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    if (!currentUser.companyId) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const companyId = currentUser.companyId;

    // Verify company exists
    const company = await companiesRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError(RECRUITERS_MESSAGES.COMPANY_NOT_FOUND);
    }

    await validateDepartment(input.departmentId, companyId);

    const existingUser = await recruiterRepository.findUserByEmail(input.email, true);
    if (existingUser) {
      throw new ConflictError(RECRUITERS_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const tempPassword = passwordHelper.generateTemporaryPassword(12);
    const tempPasswordHash = await hashPassword(tempPassword);

    const recruiter = await createRecruiterUser(input, companyId, tempPasswordHash);

    return { recruiter, temporaryPassword: tempPassword };
  },

  getRecruiterById: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await validateRecruiterExists(id);

    validateRecruiterOwnership(recruiter.companyId, currentUser);

    return recruiter;
  },

  listRecruiters: async (
    filters: RecruiterQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeUser>> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    if (!currentUser.companyId) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const companyId = currentUser.companyId;

    const where: Prisma.UserWhereInput = {
      role: Role.RECRUITER as unknown as "RECRUITER",
      companyId,
    };

    if (!filters.showDeleted) {
      where.deletedAt = null;
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

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    let orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];

    if (sortBy === "name") {
      orderBy = [{ firstName: sortOrder }, { lastName: sortOrder }];
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

    const recruiter = await validateRecruiterExists(id);

    validateRecruiterOwnership(recruiter.companyId, currentUser);

    const updateData: Prisma.UserUncheckedUpdateInput = {};

    if (input.departmentId) {
      await validateDepartment(input.departmentId, recruiter.companyId!);
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
      const first =
        input.firstName !== undefined ? input.firstName.trim() : recruiter.firstName || "";
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

    const recruiter = await validateRecruiterExists(id);

    validateRecruiterOwnership(recruiter.companyId, currentUser);

    await validateDepartment(departmentId, recruiter.companyId!);

    return await recruiterRepository.update(id, { departmentId });
  },

  activateRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await validateRecruiterExists(id, true);

    validateRecruiterOwnership(recruiter.companyId, currentUser);

    if (recruiter.deletedAt) {
      throw new UnprocessableEntityError(RECRUITERS_MESSAGES.ACTIVATE_DELETED_REJECTED);
    }
    if (recruiter.isActive) {
      throw new ValidationError("Recruiter is already active");
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

    const recruiter = await validateRecruiterExists(id);

    validateRecruiterOwnership(recruiter.companyId, currentUser);
    if (!recruiter.isActive) {
      throw new ValidationError("Recruiter is already inactive");
    }

    return await recruiterRepository.updateStatus(id, false);
  },

  softDeleteRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await validateRecruiterExists(id, true);

    validateRecruiterOwnership(recruiter.companyId, currentUser);
    if (recruiter.deletedAt) {
      throw new ValidationError("Recruiter is already deleted");
    }
    return await recruiterRepository.softDelete(id);
  },

  restoreRecruiter: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(RECRUITERS_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    const recruiter = await validateRecruiterExists(id, true);

    validateRecruiterOwnership(recruiter.companyId, currentUser);

    if (!recruiter.deletedAt) {
      throw new ValidationError("Recruiter is not deleted");
    }

    return await recruiterRepository.restore(id);
  },
};
