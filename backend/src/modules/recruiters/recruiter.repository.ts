import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { safeUserSelect } from "../../shared/prisma/selects/user.select";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";

export const recruiterRepository = {
  findById: async (id: string, includeDeleted = false) => {
    const where: Prisma.UserWhereInput = {
      id,
      role: Role.RECRUITER as unknown as "RECRUITER",
    };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    });
  },

  findUserByEmail: async (email: string, includeDeleted = false) => {
    // Check globally across all users for email uniqueness
    const where: Prisma.UserWhereInput = {
      email: {
        equals: email.trim(),
        mode: "insensitive",
      },
    };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    });
  },

  create: async (data: Prisma.UserUncheckedCreateInput) => {
    return await prisma.user.create({
      data,
      select: safeUserSelect,
    });
  },

  update: async (id: string, data: Prisma.UserUncheckedUpdateInput) => {
    return await prisma.user.update({
      where: { id },
      data,
      select: safeUserSelect,
    });
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const status = isActive ? AccountStatus.ACTIVE : AccountStatus.INACTIVE;
    return await prisma.user.update({
      where: { id },
      data: { 
        isActive,
        status: status as unknown as "ACTIVE" | "INACTIVE",
      },
      select: safeUserSelect,
    });
  },

  softDelete: async (id: string, uniqueDeletedEmail: string) => {
    return await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
        status: AccountStatus.INACTIVE as unknown as "INACTIVE",
        email: uniqueDeletedEmail,
      },
      select: safeUserSelect,
    });
  },

  restore: async (id: string, originalEmail: string) => {
    return await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
        status: AccountStatus.ACTIVE as unknown as "ACTIVE",
        email: originalEmail,
      },
      select: safeUserSelect,
    });
  },

  findMany: async (params: {
    where: Prisma.UserWhereInput;
    orderBy: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    skip: number;
    take: number;
  }) => {
    const [total, data] = await Promise.all([
      prisma.user.count({ where: params.where }),
      prisma.user.findMany({
        where: params.where,
        select: safeUserSelect,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
      }),
    ]);

    return {
      data,
      total,
    };
  },
};
