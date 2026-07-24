import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { safeCompanySelect } from "../../shared/prisma/selects/company.select";
import { AccountStatus } from "../../shared/enums/status.enum";
import { AccountStatus as PrismaAccountStatus } from "@prisma/client";

export const companiesRepository = {
  findById: async (id: string, includeDeleted = false) => {
    const where: Prisma.CompanyWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    
    return await prisma.company.findFirst({
      where,
      select: safeCompanySelect,
    });
  },

  findByName: async (name: string, includeDeleted = false) => {
    const where: Prisma.CompanyWhereInput = { name };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.company.findFirst({
      where,
      select: safeCompanySelect,
    });
  },

  findMany: async (params: {
    where: Prisma.CompanyWhereInput;
    orderBy: Prisma.CompanyOrderByWithRelationInput;
    skip: number;
    take: number;
  }) => {
    const [total, data] = await Promise.all([
      prisma.company.count({ where: params.where }),
      prisma.company.findMany({
        where: params.where,
        select: safeCompanySelect,
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

  update: async (id: string, data: Prisma.CompanyUpdateInput) => {
    return await prisma.company.update({
      where: { id },
      data,
      select: safeCompanySelect,
    });
  },

  updateStatus: async (id: string, status: AccountStatus) => {
    return await prisma.company.update({
      where: { id },
      data: { status: status as unknown as PrismaAccountStatus },
      select: safeCompanySelect,
    });
  },

  softDelete: async (id: string) => {
    return await prisma.company.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: safeCompanySelect,
    });
  },

  restore: async (id: string) => {
    return await prisma.company.update({
      where: { id },
      data: { deletedAt: null },
      select: safeCompanySelect,
    });
  },
};
