import { usersRepository } from "./users.repository";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { UserQueryFilters, SafeUser } from "./users.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { auditLogger } from "../../shared/logger/audit.logger";
import { USERS_MESSAGES } from "./users.constants";
import { Prisma } from "@prisma/client";

export const usersService = {
  getCurrentUser: async (id: string): Promise<SafeUser> => {
    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  },

  getUserById: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    // Only SUPER_ADMIN can view soft-deleted users
    const includeDeleted = currentUser.role === Role.SUPER_ADMIN;
    const user = await usersRepository.findById(id, includeDeleted);

    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }

    // Role-based authorization and company isolation checks
    if (currentUser.role === Role.SUPER_ADMIN) {
      return user;
    }

    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== user.companyId) {
        throw new ForbiddenError(USERS_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }
      return user;
    }

    if (currentUser.role === Role.RECRUITER) {
      if (!currentUser.companyId || currentUser.companyId !== user.companyId) {
        throw new ForbiddenError(USERS_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }
      // A recruiter is permitted to view other members of the same company (candidates, recruiters)
      // but NOT SUPER_ADMIN or COMPANY_ADMIN details.
      if (user.role === Role.SUPER_ADMIN || user.role === Role.COMPANY_ADMIN) {
        throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_ACCESS);
      }
      return user;
    }

    // CANDIDATEs or other roles have no business viewing other user details
    throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_ACCESS);
  },

  listUsers: async (
    filters: UserQueryFilters,
    currentUser: AuthenticatedUser
  ): Promise<PaginatedResult<SafeUser>> => {
    // Check authorization: only SUPER_ADMIN and COMPANY_ADMIN can list users
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const queryFilters = { ...filters };

    // Enforce company isolation for COMPANY_ADMIN
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId) {
        throw new ForbiddenError(USERS_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }

      // Override any requested companyId filter to restrict to their own company
      queryFilters.companyId = currentUser.companyId;

      // COMPANY_ADMIN cannot see soft-deleted users
      queryFilters.showDeleted = false;
    }

    // Construct the database query filters (Service logic)
    const where: Prisma.UserWhereInput = {};

    // Soft delete filtering
    if (!queryFilters.showDeleted) {
      where.deletedAt = null;
    }

    // Role filtering
    if (queryFilters.role) {
      where.role = queryFilters.role as unknown as Prisma.EnumRoleFilter;
    }

    // Status filtering
    if (queryFilters.status) {
      where.status = queryFilters.status as unknown as Prisma.EnumAccountStatusFilter;
    }

    // Company isolation/filtering
    if (queryFilters.companyId) {
      where.companyId = queryFilters.companyId;
    }

    // Search query matching
    if (queryFilters.search) {
      const searchLower = queryFilters.search.trim();
      if (searchLower) {
        const orConditions: Prisma.UserWhereInput[] = [
          { name: { contains: searchLower, mode: "insensitive" } },
          { email: { contains: searchLower, mode: "insensitive" } },
          { companyId: { contains: searchLower, mode: "insensitive" } },
        ];

        // Check if search matches Role enum
        const matchedRole = Object.values(Role).find(
          (r) => r.toLowerCase() === searchLower.toLowerCase()
        );
        if (matchedRole) {
          orConditions.push({ role: matchedRole as unknown as Prisma.EnumRoleFilter });
        }

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

    const page = queryFilters.page || 1;
    const limit = queryFilters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = queryFilters.sortBy || "createdAt";
    const sortOrder = queryFilters.sortOrder || "desc";
    const orderBy: Prisma.UserOrderByWithRelationInput = { [sortBy]: sortOrder };

    const { data, total } = await usersRepository.findMany({
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

  updateUserStatus: async (
    id: string,
    status: AccountStatus,
    currentUser: AuthenticatedUser
  ): Promise<SafeUser> => {
    // Prevent self status suspension or deactivation
    if (
      id === currentUser.id &&
      (status === AccountStatus.SUSPENDED || status === AccountStatus.INACTIVE)
    ) {
      throw new ValidationError("You cannot deactivate or suspend your own account");
    }

    // Only SUPER_ADMIN and COMPANY_ADMIN can update status
    if (currentUser.role !== Role.SUPER_ADMIN && currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_ACCESS);
    }

    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }

    // Company isolation for COMPANY_ADMIN
    if (currentUser.role === Role.COMPANY_ADMIN) {
      if (!currentUser.companyId || currentUser.companyId !== user.companyId) {
        throw new ForbiddenError(USERS_MESSAGES.COMPANY_ISOLATION_VIOLATION);
      }

      // COMPANY_ADMIN cannot modify a SUPER_ADMIN user
      if (user.role === Role.SUPER_ADMIN) {
        throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_ACCESS);
      }
    }

    const updatedUser = await usersRepository.updateStatus(id, status);

    // Standardised Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "UPDATE_USER_STATUS",
      category: "USER_MANAGEMENT",
      resourceId: id,
      resourceType: "USER",
      description: `Updated status of user ${user.email} (${id}) from ${user.status} to ${status}`,
      severity: "MEDIUM",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: user.companyId || null,
        oldStatus: user.status,
        newStatus: status,
        timestamp: new Date().toISOString(),
      },
    });

    return updatedUser;
  },

  softDeleteUser: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    // Prevent self deletion
    if (id === currentUser.id) {
      throw new ValidationError("You cannot delete your own account");
    }

    // Only SUPER_ADMIN can soft delete users
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_DELETE);
    }

    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }

    const deletedUser = await usersRepository.softDelete(id);

    // Standardised Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "SOFT_DELETE_USER",
      category: "USER_MANAGEMENT",
      resourceId: id,
      resourceType: "USER",
      description: `Soft deleted user ${user.email} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: user.companyId || null,
        timestamp: new Date().toISOString(),
      },
    });

    return deletedUser;
  },

  restoreUser: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    // Only SUPER_ADMIN can restore users
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_RESTORE);
    }

    // To restore, we must search including soft-deleted users
    const user = await usersRepository.findById(id, true);
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.deletedAt) {
      // User is not deleted, nothing to restore
      return user;
    }

    const restoredUser = await usersRepository.restore(id);

    // Standardised Audit Logging
    auditLogger.log({
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      action: "RESTORE_USER",
      category: "USER_MANAGEMENT",
      resourceId: id,
      resourceType: "USER",
      description: `Restored soft-deleted user ${user.email} (${id})`,
      severity: "HIGH",
      metadata: {
        actorCompanyId: currentUser.companyId || null,
        targetCompanyId: user.companyId || null,
        timestamp: new Date().toISOString(),
      },
    });

    return restoredUser;
  },
};
