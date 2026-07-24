import { prisma } from "../../config/prisma";
import { Prisma, AccountStatus as PrismaAccountStatus } from "@prisma/client";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";
import { UserQueryFilters, SafeUser } from "./users.types";

export const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
  isVerified: true,
  companyId: true,
  deletedAt: true,
  mustChangePassword: true,
  lastLoginAt: true,
  passwordChangedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const usersRepository = {
  findById: async (id: string, includeDeleted = false): Promise<SafeUser | null> => {
    const where: Prisma.UserWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    
    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    }) as SafeUser | null;
  },

  findByEmail: async (email: string, includeDeleted = false): Promise<SafeUser | null> => {
    const where: Prisma.UserWhereInput = { email };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    }) as SafeUser | null;
  },

  findMany: async (
    filters: UserQueryFilters
  ): Promise<{ data: SafeUser[]; total: number }> => {
    const where: Prisma.UserWhereInput = {};

    // Soft delete filtering
    if (!filters.showDeleted) {
      where.deletedAt = null;
    }

    // Role filtering
    if (filters.role) {
      where.role = filters.role as unknown as Prisma.EnumRoleFilter;
    }

    // Status filtering
    if (filters.status) {
      where.status = filters.status as unknown as Prisma.EnumAccountStatusFilter;
    }

    // Company isolation/filtering
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }

    // Search query matching
    if (filters.search) {
      const searchLower = filters.search.trim();
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

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    const [total, data] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: safeUserSelect,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: data as SafeUser[],
      total,
    };
  },

  updateStatus: async (id: string, status: AccountStatus): Promise<SafeUser> => {
    return await prisma.user.update({
      where: { id },
      data: { status: status as unknown as PrismaAccountStatus },
      select: safeUserSelect,
    }) as SafeUser;
  },

  softDelete: async (id: string): Promise<SafeUser> => {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    }) as SafeUser;
  },

  restore: async (id: string): Promise<SafeUser> => {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      select: safeUserSelect,
    }) as SafeUser;
  },
};
