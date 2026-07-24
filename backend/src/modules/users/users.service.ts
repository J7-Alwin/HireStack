import { usersRepository } from "./users.repository";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { UserQueryFilters, SafeUser } from "./users.types";
import { AuthenticatedUser, PaginatedResult } from "../../shared/types";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ForbiddenError } from "../../shared/errors/ForbiddenError";
import { auditLogger } from "../../shared/logger/audit.logger";
import { USERS_MESSAGES } from "./users.constants";

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
    } else if (currentUser.role === Role.SUPER_ADMIN) {
      // SUPER_ADMIN can filter by companyId if provided, otherwise sees everyone
    }

    const { data, total } = await usersRepository.findMany(queryFilters);
    const page = queryFilters.page || 1;
    const limit = queryFilters.limit || 10;

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

    // Audit Log the status change
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
    });

    return updatedUser;
  },

  softDeleteUser: async (id: string, currentUser: AuthenticatedUser): Promise<SafeUser> => {
    // Only SUPER_ADMIN can soft delete users
    if (currentUser.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenError(USERS_MESSAGES.FORBIDDEN_DELETE);
    }

    const user = await usersRepository.findById(id);
    if (!user) {
      throw new NotFoundError(USERS_MESSAGES.USER_NOT_FOUND);
    }

    const deletedUser = await usersRepository.softDelete(id);

    // Audit Log the deletion
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

    // Audit Log the restore
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
    });

    return restoredUser;
  },
};
