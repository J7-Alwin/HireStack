import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";

export const jobSelect = {
  id: true,
  companyId: true,
  departmentId: true,
  department: {
    select: {
      id: true,
      name: true,
    },
  },
  jobCode: true,
  title: true,
  description: true,
  responsibilities: true,
  requirements: true,
  benefits: true,
  employmentType: true,
  workplaceType: true,
  experienceMin: true,
  experienceMax: true,
  salaryMin: true,
  salaryMax: true,
  currency: true,
  location: true,
  openings: true,
  visibility: true,
  status: true,
  closingDate: true,
  publishedAt: true,
  archivedAt: true,
  deletedAt: true,
  isActive: true,
  createdBy: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  recruiters: {
    select: {
      assignedAt: true,
      recruiter: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          designation: true,
          avatar: true,
        },
      },
    },
  },
  skills: {
    select: {
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

export const jobRepository = {
  findById: async (id: string, includeDeleted = false) => {
    const where: Prisma.JobWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.job.findFirst({
      where,
      select: jobSelect,
    });
  },

  findByJobCode: async (jobCode: string, includeDeleted = false) => {
    const where: Prisma.JobWhereInput = { jobCode };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    return await prisma.job.findFirst({
      where,
      select: jobSelect,
    });
  },

  create: async (
    data: Prisma.JobUncheckedCreateInput,
    recruiterIds?: string[],
    skillIds?: string[]
  ) => {
    return await prisma.job.create({
      data: {
        ...data,
        recruiters: recruiterIds
          ? {
              create: recruiterIds.map((recruiterId) => ({
                recruiterId,
                assignedById: data.createdBy,
              })),
            }
          : undefined,
        skills: skillIds
          ? {
              create: skillIds.map((skillId) => ({
                skillId,
              })),
            }
          : undefined,
      },
      select: jobSelect,
    });
  },

  update: async (
    id: string,
    data: Prisma.JobUncheckedUpdateInput,
    recruiterIds?: string[],
    skillIds?: string[],
    updaterUserId?: string
  ) => {
    return await prisma.$transaction(async (tx) => {
      if (recruiterIds !== undefined) {
        // Delete all and recreate to sync
        await tx.jobRecruiter.deleteMany({ where: { jobId: id } });
        if (recruiterIds.length > 0 && updaterUserId) {
          await tx.jobRecruiter.createMany({
            data: recruiterIds.map((recruiterId) => ({
              jobId: id,
              recruiterId,
              assignedById: updaterUserId,
            })),
          });
        }
      }

      if (skillIds !== undefined) {
        // Delete all and recreate to sync
        await tx.jobSkill.deleteMany({ where: { jobId: id } });
        if (skillIds.length > 0) {
          await tx.jobSkill.createMany({
            data: skillIds.map((skillId) => ({
              jobId: id,
              skillId,
            })),
          });
        }
      }

      return await tx.job.update({
        where: { id },
        data,
        select: jobSelect,
      });
    });
  },

  softDelete: async (id: string) => {
    return await prisma.job.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      select: jobSelect,
    });
  },

  restore: async (id: string) => {
    return await prisma.job.update({
      where: { id },
      data: {
        deletedAt: null,
        isActive: true,
      },
      select: jobSelect,
    });
  },

  assignRecruiters: async (
    jobId: string,
    recruiterIds: string[],
    assignedById: string
  ) => {
    return await prisma.$transaction(async (tx) => {
      for (const recruiterId of recruiterIds) {
        await tx.jobRecruiter.upsert({
          where: { jobId_recruiterId: { jobId, recruiterId } },
          create: {
            jobId,
            recruiterId,
            assignedById,
          },
          update: {}, // Do nothing if already assigned
        });
      }
      return await tx.job.findUnique({
        where: { id: jobId },
        select: jobSelect,
      });
    });
  },

  removeRecruiter: async (jobId: string, recruiterId: string) => {
    await prisma.jobRecruiter.delete({
      where: {
        jobId_recruiterId: {
          jobId,
          recruiterId,
        },
      },
    });

    return await prisma.job.findUnique({
      where: { id: jobId },
      select: jobSelect,
    });
  },

  findMany: async (params: {
    where: Prisma.JobWhereInput;
    orderBy: Prisma.JobOrderByWithRelationInput | Prisma.JobOrderByWithRelationInput[];
    skip: number;
    take: number;
  }) => {
    const [total, data] = await Promise.all([
      prisma.job.count({ where: params.where }),
      prisma.job.findMany({
        where: params.where,
        select: jobSelect,
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

  verifySkillsExist: async (skillIds: string[]) => {
    const skills = await prisma.skill.findMany({
      where: {
        id: { in: skillIds },
      },
      select: {
        id: true,
      },
    });
    return skills.map((s) => s.id);
  },
};
