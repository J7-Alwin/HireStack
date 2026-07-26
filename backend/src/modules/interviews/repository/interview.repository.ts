import { Prisma, InterviewRound } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { CreateInterviewInput, InterviewQueryFilters } from "../types/interview.types";

export const RecruiterSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

export const CandidateSelect = {
  id: true,
  candidateCode: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
} as const;

export const JobSelect = {
  id: true,
  jobCode: true,
  title: true,
} as const;

export const ApplicationSelect = {
  id: true,
  applicationCode: true,
  stage: true,
  status: true,
  assignedRecruiterId: true,
  assignedRecruiter: {
    select: RecruiterSelect,
  },
  candidate: {
    select: CandidateSelect,
  },
  job: {
    select: JobSelect,
  },
} as const;

export const InterviewerSelect = {
  id: true,
  name: true,
  firstName: true,
  lastName: true,
  email: true,
  designation: true,
} as const;

export const InterviewSelect = {
  id: true,
  interviewCode: true,
  companyId: true,
  applicationId: true,
  interviewType: true,
  round: true,
  status: true,
  outcome: true,
  mode: true,
  scheduledDate: true,
  startTime: true,
  endTime: true,
  timeZone: true,
  meetingLink: true,
  location: true,
  notes: true,
  resultNotes: true,
  cancellationReason: true,
  cancelledAt: true,
  cancelledById: true,
  completedAt: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  application: {
    select: ApplicationSelect,
  },
  interviewers: {
    select: {
      id: true,
      interviewerId: true,
      interviewer: {
        select: InterviewerSelect,
      },
    },
  },
} as const;

const buildDateRange = (dateStr: string) => {
  const date = new Date(dateStr);
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);
  return {
    gte: startOfDay,
    lte: endOfDay,
  };
};

export const interviewRepository = {
  create: async (
    companyId: string,
    interviewCode: string,
    input: Omit<CreateInterviewInput, "interviewers"> & { createdBy: string },
    interviewerIds: string[],
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.interview.create({
      data: {
        interviewCode,
        companyId,
        applicationId: input.applicationId,
        interviewType: input.interviewType,
        round: input.round,
        mode: input.mode,
        scheduledDate: new Date(input.scheduledDate),
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        timeZone: input.timeZone,
        meetingLink: input.meetingLink,
        location: input.location,
        notes: input.notes,
        createdBy: input.createdBy,
        interviewers: {
          create: interviewerIds.map((interviewerId) => ({
            interviewerId,
          })),
        },
      },
      select: InterviewSelect,
    });
  },

  findById: async (id: string, includeDeleted = false, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.interview.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: InterviewSelect,
    });
  },

  findByCode: async (companyId: string, interviewCode: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.interview.findFirst({
      where: {
        companyId,
        interviewCode,
        deletedAt: null,
      },
      select: InterviewSelect,
    });
  },

  findActiveApplication: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        companyId: true,
        status: true,
        assignedRecruiterId: true,
      },
    });
  },

  incrementInterviewCounter: async (companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    const counter = await client.companyInterviewCounter.upsert({
      where: { companyId },
      update: { count: { increment: 1 } },
      create: { companyId, count: 1 },
    });
    return counter.count;
  },

  findInterviewerConflicts: async (
    interviewerIds: string[],
    date: Date,
    startTime: Date,
    endTime: Date,
    skipInterviewId?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.interview.findFirst({
      where: {
        ...(skipInterviewId ? { id: { not: skipInterviewId } } : {}),
        status: { not: "CANCELLED" },
        deletedAt: null,
        scheduledDate: date,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
        interviewers: {
          some: {
            interviewerId: { in: interviewerIds },
          },
        },
      },
      select: {
        id: true,
        interviewCode: true,
      },
    });
  },

  findDuplicateActiveRound: async (
    applicationId: string,
    round: InterviewRound,
    skipInterviewId?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.interview.findFirst({
      where: {
        ...(skipInterviewId ? { id: { not: skipInterviewId } } : {}),
        applicationId,
        round,
        status: { not: "CANCELLED" },
        deletedAt: null,
      },
      select: {
        id: true,
        interviewCode: true,
      },
    });
  },

  update: async (
    id: string,
    data: Prisma.InterviewUncheckedUpdateInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.interview.update({
      where: { id },
      data,
      select: InterviewSelect,
    });
  },

  updateInterviewers: async (
    id: string,
    interviewerIds: string[],
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    await client.interviewInterviewer.deleteMany({
      where: { interviewId: id },
    });
    await client.interviewInterviewer.createMany({
      data: interviewerIds.map((interviewerId) => ({
        interviewId: id,
        interviewerId,
      })),
    });
    return await client.interview.findFirst({
      where: { id },
      select: InterviewSelect,
    });
  },

  softDelete: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.interview.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: InterviewSelect,
    });
  },

  findMany: async (
    companyId: string,
    filters: InterviewQueryFilters,
    skip: number,
    take: number,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;

    const where: Prisma.InterviewWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.interviewType) where.interviewType = filters.interviewType;
    if (filters.round) where.round = filters.round;
    if (filters.status) where.status = filters.status;
    if (filters.outcome) where.outcome = filters.outcome;
    if (filters.mode) where.mode = filters.mode;

    if (filters.recruiterId) {
      where.application = {
        assignedRecruiterId: filters.recruiterId,
      };
    }

    if (filters.interviewerId) {
      where.interviewers = {
        some: {
          interviewerId: filters.interviewerId,
        },
      };
    }

    if (filters.scheduledDate) {
      where.scheduledDate = buildDateRange(filters.scheduledDate);
    }

    if (filters.createdAt) {
      where.createdAt = buildDateRange(filters.createdAt);
    }

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { interviewCode: { contains: search, mode: "insensitive" } },
        {
          application: {
            OR: [
              { applicationCode: { contains: search, mode: "insensitive" } },
              {
                candidate: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { candidateCode: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
              {
                job: {
                  title: { contains: search, mode: "insensitive" },
                },
              },
              {
                assignedRecruiter: {
                  OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          },
        },
        {
          interviewers: {
            some: {
              interviewer: {
                OR: [
                  { name: { contains: search, mode: "insensitive" } },
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    let orderBy:
      Prisma.InterviewOrderByWithRelationInput | Prisma.InterviewOrderByWithRelationInput[] = {
      scheduledDate: "asc",
    };

    if (filters.sortBy) {
      const order = filters.sortOrder || "asc";
      if (filters.sortBy === "scheduledDate") {
        orderBy = [{ scheduledDate: order }, { startTime: order }];
      } else if (filters.sortBy === "startTime") {
        orderBy = { startTime: order };
      } else if (filters.sortBy === "createdAt") {
        orderBy = { createdAt: order };
      } else if (filters.sortBy === "updatedAt") {
        orderBy = { updatedAt: order };
      } else if (filters.sortBy === "interviewType") {
        orderBy = { interviewType: order };
      } else if (filters.sortBy === "round") {
        orderBy = { round: order };
      } else if (filters.sortBy === "status") {
        orderBy = { status: order };
      }
    } else {
      orderBy = [{ scheduledDate: "asc" }, { startTime: "asc" }];
    }

    const [data, total] = await Promise.all([
      client.interview.findMany({
        where,
        select: InterviewSelect,
        orderBy,
        skip,
        take,
      }),
      client.interview.count({
        where,
      }),
    ]);

    return {
      data,
      total,
    };
  },

  findUsersCompany: async (userIds: string[], tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.user.findMany({
      where: {
        id: { in: userIds },
        deletedAt: null,
      },
      select: {
        id: true,
        companyId: true,
        role: true,
      },
    });
  },
};
