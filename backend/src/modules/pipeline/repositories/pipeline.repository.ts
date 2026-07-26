import { Prisma, PipelineStage, PipelineTimelineEventType } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { CreatePipelineInput, PipelineQueryFilters } from "../types/pipeline.types";
import {
  PipelineDto,
  PipelineHistoryDto,
  PipelineTimelineDto,
  toPipelineDto,
  toPipelineHistoryDto,
  toPipelineTimelineDto,
} from "../dto/pipeline.dto";

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

export const PipelineDetailSelect = {
  id: true,
  companyId: true,
  applicationId: true,
  candidateId: true,
  recruiterId: true,
  jobId: true,
  currentStage: true,
  previousStage: true,
  stageChangedAt: true,
  stageOrder: true,
  notes: true,
  isCompleted: true,
  completedReason: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  application: {
    select: {
      id: true,
      applicationCode: true,
      stage: true,
      status: true,
      assignedRecruiterId: true,
    },
  },
  candidate: {
    select: CandidateSelect,
  },
  job: {
    select: JobSelect,
  },
  recruiter: {
    select: RecruiterSelect,
  },
} as const;

export const HistorySelect = {
  id: true,
  pipelineId: true,
  fromStage: true,
  toStage: true,
  movedById: true,
  reason: true,
  comments: true,
  movedAt: true,
  movedBy: {
    select: RecruiterSelect,
  },
} as const;

export const TimelineSelect = {
  id: true,
  pipelineId: true,
  eventType: true,
  title: true,
  description: true,
  createdById: true,
  createdAt: true,
  createdBy: {
    select: RecruiterSelect,
  },
} as const;

const notDeleted = { deletedAt: null } as const;

export const pipelineRepository = {
  createPipeline: async (
    companyId: string,
    candidateId: string,
    recruiterId: string,
    jobId: string,
    input: CreatePipelineInput,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineDto> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.create({
      data: {
        companyId,
        applicationId: input.applicationId,
        candidateId,
        recruiterId,
        jobId,
        currentStage: PipelineStage.APPLIED,
        stageOrder: 1,
        notes: input.notes || null,
        isCompleted: false,
      },
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  findPipelineById: async (
    id: string,
    includeDeleted = false,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineDto | null> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : notDeleted),
      },
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  findPipelineByApplication: async (
    applicationId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineDto | null> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.findFirst({
      where: {
        applicationId,
        ...notDeleted,
      },
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  updatePipelineStage: async (
    id: string,
    data: {
      currentStage: PipelineStage;
      previousStage: PipelineStage;
      stageOrder: number;
      stageChangedAt: Date;
      isCompleted: boolean;
      completedReason: string | null;
    },
    tx?: Prisma.TransactionClient
  ): Promise<PipelineDto> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.update({
      where: { id },
      data,
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  addPipelineNotes: async (
    id: string,
    notes: string,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineDto> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.update({
      where: { id },
      data: { notes },
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  createHistoryRecord: async (
    pipelineId: string,
    fromStage: PipelineStage | null,
    toStage: PipelineStage,
    movedById: string,
    reason?: string | null,
    comments?: string | null,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineHistoryDto> => {
    const client = tx || prisma;
    const raw = await client.pipelineHistory.create({
      data: {
        pipelineId,
        fromStage,
        toStage,
        movedById,
        reason: reason || null,
        comments: comments || null,
      },
      select: HistorySelect,
    });
    return toPipelineHistoryDto(raw);
  },

  createTimelineEvent: async (
    pipelineId: string,
    eventType: PipelineTimelineEventType,
    title: string,
    description: string,
    createdById: string,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineTimelineDto> => {
    const client = tx || prisma;
    const raw = await client.pipelineTimeline.create({
      data: {
        pipelineId,
        eventType,
        title,
        description,
        createdById,
      },
      select: TimelineSelect,
    });
    return toPipelineTimelineDto(raw);
  },

  findHistoryByPipelineId: async (
    pipelineId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineHistoryDto[]> => {
    const client = tx || prisma;
    const rawList = await client.pipelineHistory.findMany({
      where: { pipelineId },
      select: HistorySelect,
      orderBy: { movedAt: "desc" },
    });
    return rawList.map(toPipelineHistoryDto);
  },

  findTimelineByPipelineId: async (
    pipelineId: string,
    tx?: Prisma.TransactionClient
  ): Promise<PipelineTimelineDto[]> => {
    const client = tx || prisma;
    const rawList = await client.pipelineTimeline.findMany({
      where: { pipelineId },
      select: TimelineSelect,
      orderBy: { createdAt: "desc" },
    });
    return rawList.map(toPipelineTimelineDto);
  },

  findApplicationDetails: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.application.findFirst({
      where: {
        id,
        ...notDeleted,
      },
      select: {
        id: true,
        companyId: true,
        candidateId: true,
        assignedRecruiterId: true,
        jobId: true,
        status: true,
      },
    });
  },

  softDeletePipeline: async (id: string, tx?: Prisma.TransactionClient): Promise<PipelineDto> => {
    const client = tx || prisma;
    const raw = await client.hiringPipeline.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: PipelineDetailSelect,
    });
    return toPipelineDto(raw);
  },

  buildSearchWhere: (search?: string): Prisma.HiringPipelineWhereInput => {
    if (!search) return {};
    return {
      OR: [
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
          application: {
            applicationCode: { contains: search, mode: "insensitive" },
          },
        },
        {
          job: {
            title: { contains: search, mode: "insensitive" },
          },
        },
        {
          recruiter: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ],
    };
  },

  buildFilterWhere: (filters: PipelineQueryFilters): Prisma.HiringPipelineWhereInput => {
    const where: Prisma.HiringPipelineWhereInput = {};

    if (filters.currentStage) where.currentStage = filters.currentStage;
    if (filters.recruiterId) where.recruiterId = filters.recruiterId;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.candidateId) where.candidateId = filters.candidateId;

    if (filters.departmentId) {
      where.job = { departmentId: filters.departmentId };
    }

    if (filters.completed !== undefined) {
      where.isCompleted = filters.completed;
    }
    if (filters.active !== undefined) {
      where.isCompleted = !filters.active;
    }

    if (filters.hired) {
      where.currentStage = PipelineStage.HIRED;
    } else if (filters.rejected) {
      where.currentStage = PipelineStage.REJECTED;
    } else if (filters.withdrawn) {
      where.currentStage = PipelineStage.WITHDRAWN;
    }

    if (filters.startDate || filters.endDate) {
      where.stageChangedAt = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    return where;
  },

  buildSortQuery: (
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Prisma.HiringPipelineOrderByWithRelationInput => {
    const order = sortOrder || "desc";
    if (!sortBy) return { createdAt: "desc" };

    switch (sortBy) {
      case "candidateName":
        return { candidate: { firstName: order } };
      case "jobTitle":
        return { job: { title: order } };
      case "recruiter":
        return { recruiter: { firstName: order } };
      case "stage":
        return { currentStage: order };
      case "stageChangedDate":
        return { stageChangedAt: order };
      case "createdAt":
        return { createdAt: order };
      case "updatedAt":
        return { updatedAt: order };
      default:
        return { createdAt: order };
    }
  },

  findPipelinesMany: async (
    companyId: string,
    filters: PipelineQueryFilters,
    skip: number,
    take: number,
    tx?: Prisma.TransactionClient
  ): Promise<{ data: PipelineDto[]; total: number }> => {
    const client = tx || prisma;
    const searchWhere = pipelineRepository.buildSearchWhere(filters.search);
    const filterWhere = pipelineRepository.buildFilterWhere(filters);
    const orderBy = pipelineRepository.buildSortQuery(filters.sortBy, filters.sortOrder);

    const where: Prisma.HiringPipelineWhereInput = {
      companyId,
      ...notDeleted,
      ...filterWhere,
      ...searchWhere,
    };

    const [data, total] = await Promise.all([
      client.hiringPipeline.findMany({
        where,
        select: PipelineDetailSelect,
        orderBy,
        skip,
        take,
      }),
      client.hiringPipeline.count({
        where,
      }),
    ]);

    return {
      data: data.map(toPipelineDto),
      total,
    };
  },

  aggregateDashboardMetrics: async (
    companyId: string,
    recruiterId?: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;

    const baseWhere: Prisma.HiringPipelineWhereInput = {
      companyId,
      ...notDeleted,
      ...(recruiterId ? { recruiterId } : {}),
    };

    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [
      activeCandidates,
      hiredCount,
      rejectedCount,
      withdrawnCount,
      interviewsToday,
      offersPending,
      offersAccepted,
      stageBreakdownRaw,
    ] = await Promise.all([
      // 1. Active Candidates (isCompleted: false)
      client.hiringPipeline.count({
        where: {
          ...baseWhere,
          isCompleted: false,
        },
      }),

      // 2. Candidates Hired (currentStage: HIRED)
      client.hiringPipeline.count({
        where: {
          ...baseWhere,
          currentStage: PipelineStage.HIRED,
        },
      }),

      // 3. Rejections (currentStage: REJECTED)
      client.hiringPipeline.count({
        where: {
          ...baseWhere,
          currentStage: PipelineStage.REJECTED,
        },
      }),

      // 4. Withdrawals (currentStage: WITHDRAWN)
      client.hiringPipeline.count({
        where: {
          ...baseWhere,
          currentStage: PipelineStage.WITHDRAWN,
        },
      }),

      // 5. Interviews scheduled today
      client.interview.count({
        where: {
          application: {
            pipeline: {
              ...baseWhere,
            },
          },
          status: "SCHEDULED",
          scheduledDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
          deletedAt: null,
        },
      }),

      // 6. Offers pending review/approval
      client.offer.count({
        where: {
          application: {
            pipeline: {
              ...baseWhere,
            },
          },
          status: "PENDING_APPROVAL",
          deletedAt: null,
        },
      }),

      // 7. Offers accepted
      client.offer.count({
        where: {
          application: {
            pipeline: {
              ...baseWhere,
            },
          },
          status: "ACCEPTED",
          deletedAt: null,
        },
      }),

      // 8. Stage Breakdown (active pipelines group by currentStage)
      client.hiringPipeline.groupBy({
        by: ["currentStage"],
        where: {
          ...baseWhere,
          isCompleted: false,
        },
        _count: {
          id: true,
        },
      }),
    ]);

    // Format stage breakdown
    const stageBreakdown: Record<string, number> = {};
    for (const item of stageBreakdownRaw) {
      stageBreakdown[item.currentStage] = item._count.id;
    }

    return {
      activeCandidates,
      hiredCount,
      rejectedCount,
      withdrawnCount,
      interviewsToday,
      offersPending,
      offersAccepted,
      stageBreakdown,
    };
  },
};
