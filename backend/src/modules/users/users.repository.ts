import { prisma } from "../../config/prisma";
import { Prisma, AccountStatus as PrismaAccountStatus } from "@prisma/client";
import { safeUserSelect } from "../../shared/prisma/selects/user.select";
import { AccountStatus } from "../../shared/enums/status.enum";

export const usersRepository = {
  findById: async (id: string, includeDeleted = false) => {
    const where: Prisma.UserWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    });
  },

  findByEmail: async (email: string, includeDeleted = false) => {
    const where: Prisma.UserWhereInput = { email };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.user.findFirst({
      where,
      select: safeUserSelect,
    });
  },

  findMany: async (params: {
    where: Prisma.UserWhereInput;
    orderBy: Prisma.UserOrderByWithRelationInput;
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

  updateStatus: async (id: string, status: AccountStatus) => {
    return await prisma.user.update({
      where: { id },
      data: { status: status as unknown as PrismaAccountStatus },
      select: safeUserSelect,
    });
  },

  softDelete: async (id: string) => {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: safeUserSelect,
    });
  },

  restore: async (id: string) => {
    return await prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      select: safeUserSelect,
    });
  },
};
