import { prisma } from "../../config/prisma";
import { Prisma, ApplicationStatus } from "@prisma/client";
import { ApplicationQueryFilters } from "./application.types";

export const applicationSelect = {
  id: true,
  applicationCode: true,
  companyId: true,
  candidateId: true,
  candidate: {
    select: {
      id: true,
      candidateCode: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      status: true,
      deletedAt: true,
    },
  },
  jobId: true,
  job: {
    select: {
      id: true,
      jobCode: true,
      title: true,
      status: true,
      deletedAt: true,
    },
  },
  assignedRecruiterId: true,
  assignedRecruiter: {
    select: {
      id: true,
      name: true,
      email: true,
      firstName: true,
      lastName: true,
      designation: true,
      avatar: true,
      companyId: true,
      role: true,
    },
  },
  stage: true,
  status: true,
  source: true,
  remarks: true,
  rejectionReasonCode: true,
  rejectionReasonNote: true,
  withdrawalReasonCode: true,
  withdrawalReasonNote: true,
  appliedAt: true,
  createdBy: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  updatedBy: true,
  updater: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const applicationRepository = {
  findById: async (id: string, includeDeleted = false, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    const where: Prisma.ApplicationWhereInput = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    return await client.application.findFirst({
      where,
      select: applicationSelect,
    });
  },

  findByCode: async (companyId: string, applicationCode: string, includeDeleted = false, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    const where: Prisma.ApplicationWhereInput = { companyId, applicationCode };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    return await client.application.findFirst({
      where,
      select: applicationSelect,
    });
  },

  findActiveApplication: async (
    companyId: string,
    candidateId: string,
    jobId: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.application.findFirst({
      where: {
        companyId,
        candidateId,
        jobId,
        status: ApplicationStatus.ACTIVE,
        deletedAt: null,
      },
      select: { id: true },
    });
  },

  incrementApplicationCounter: async (companyId: string, tx: Prisma.TransactionClient) => {
    const counter = await tx.companyApplicationCounter.upsert({
      where: { companyId },
      update: { count: { increment: 1 } },
      create: { companyId, count: 1 },
    });
    return counter.count;
  },

  create: async (data: Prisma.ApplicationUncheckedCreateInput, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.create({
      data,
      select: applicationSelect,
    });
  },

  update: async (id: string, data: Prisma.ApplicationUncheckedUpdateInput, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.update({
      where: { id },
      data,
      select: applicationSelect,
    });
  },

  softDelete: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: applicationSelect,
    });
  },

  restore: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.update({
      where: { id },
      data: { deletedAt: null },
      select: applicationSelect,
    });
  },

  findMany: async (
    companyId: string,
    filters: ApplicationQueryFilters,
    skip: number,
    limit: number,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    const where: Prisma.ApplicationWhereInput = {
      companyId,
      deletedAt: null,
    };

    // Filter by Stage
    if (filters.stage) {
      where.stage = filters.stage;
    }

    // Filter by Status
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by Recruiter
    if (filters.recruiter) {
      where.assignedRecruiterId = filters.recruiter;
    }

    // Filter by Candidate
    if (filters.candidate) {
      where.candidateId = filters.candidate;
    }

    // Filter by Job
    if (filters.job) {
      where.jobId = filters.job;
    }

    // Filter by Source
    if (filters.source) {
      where.source = filters.source;
    }

    // Filter by Applied Date
    if (filters.appliedDate) {
      const date = new Date(filters.appliedDate);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        where.appliedAt = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    // Filter by Created Date
    if (filters.createdDate) {
      const date = new Date(filters.createdDate);
      if (!isNaN(date.getTime())) {
        const startOfDay = new Date(date.setHours(0, 0, 0, 0));
        const endOfDay = new Date(date.setHours(23, 59, 59, 999));
        where.createdAt = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }
    }

    // Search query mapping (Application Code, Candidate Name/Code, Job Title/Code, Recruiter Name)
    if (filters.search) {
      const searchLower = filters.search.trim();
      where.OR = [
        { applicationCode: { contains: searchLower, mode: "insensitive" } },
        { candidate: { firstName: { contains: searchLower, mode: "insensitive" } } },
        { candidate: { lastName: { contains: searchLower, mode: "insensitive" } } },
        { candidate: { candidateCode: { contains: searchLower, mode: "insensitive" } } },
        { job: { title: { contains: searchLower, mode: "insensitive" } } },
        { job: { jobCode: { contains: searchLower, mode: "insensitive" } } },
        { assignedRecruiter: { firstName: { contains: searchLower, mode: "insensitive" } } },
        { assignedRecruiter: { lastName: { contains: searchLower, mode: "insensitive" } } },
        { assignedRecruiter: { name: { contains: searchLower, mode: "insensitive" } } },
      ];
    }

    // Sorting
    const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [];
    const sortOrder = filters.sortOrder || "desc";

    if (filters.sortBy === "candidateName") {
      orderBy.push({ candidate: { firstName: sortOrder } });
      orderBy.push({ candidate: { lastName: sortOrder } });
    } else if (filters.sortBy === "jobTitle") {
      orderBy.push({ job: { title: sortOrder } });
    } else if (filters.sortBy) {
      const sortBy = filters.sortBy;
      if (sortBy === "appliedAt" || sortBy === "createdAt" || sortBy === "updatedAt" || sortBy === "stage" || sortBy === "status") {
        orderBy.push({ [sortBy]: sortOrder });
      }
    } else {
      orderBy.push({ createdAt: "desc" });
    }

    const [total, data] = await Promise.all([
      client.application.count({ where }),
      client.application.findMany({
        where,
        select: applicationSelect,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      total,
    };
  },

  // Helper entity verification methods (transaction-aware)
  findCandidateById: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.candidate.findFirst({
      where: { id },
    });
  },

  findJobById: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.job.findFirst({
      where: { id },
    });
  },

  findUserById: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.user.findFirst({
      where: { id },
    });
  },
};
