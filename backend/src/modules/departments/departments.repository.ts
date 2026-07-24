import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
import { safeDepartmentSelect } from "../../shared/prisma/selects/department.select";

export const departmentsRepository = {
  findById: async (id: string, includeDeleted = false) => {
    const where: Prisma.DepartmentWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.department.findFirst({
      where,
      select: safeDepartmentSelect,
    });
  },

  findByNameInCompany: async (companyId: string, name: string, includeDeleted = false) => {
    const where: Prisma.DepartmentWhereInput = {
      companyId,
      name: {
        equals: name.trim(),
        mode: "insensitive",
      },
    };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.department.findFirst({
      where,
      select: safeDepartmentSelect,
    });
  },

  create: async (data: Prisma.DepartmentUncheckedCreateInput) => {
    return await prisma.department.create({
      data,
      select: safeDepartmentSelect,
    });
  },

  update: async (id: string, data: Prisma.DepartmentUpdateInput) => {
    return await prisma.department.update({
      where: { id },
      data,
      select: safeDepartmentSelect,
    });
  },

  updateStatus: async (id: string, isActive: boolean) => {
    return await prisma.department.update({
      where: { id },
      data: { isActive },
      select: safeDepartmentSelect,
    });
  },

  softDelete: async (id: string, name: string) => {
    return await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), name },
      select: safeDepartmentSelect,
    });
  },

  restore: async (id: string, name: string) => {
    return await prisma.department.update({
      where: { id },
      data: { deletedAt: null, name },
      select: safeDepartmentSelect,
    });
  },

  findMany: async (params: {
    where: Prisma.DepartmentWhereInput;
    orderBy: Prisma.DepartmentOrderByWithRelationInput;
    skip: number;
    take: number;
  }) => {
    const [total, data] = await Promise.all([
      prisma.department.count({ where: params.where }),
      prisma.department.findMany({
        where: params.where,
        select: safeDepartmentSelect,
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

  countActiveRecruiters: async (departmentId: string): Promise<number> => {
    // Check if any active user with recruiter role is assigned to this department
    return await prisma.user.count({
      where: {
        departmentId,
        role: "RECRUITER",
        deletedAt: null,
      },
    });
  },

  countActiveJobs: async (departmentId: string): Promise<number> => {
    // Check placeholder Job model
    return await prisma.job.count({
      where: {
        departmentId,
      },
    });
  },
};
