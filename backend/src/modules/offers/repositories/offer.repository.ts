import { Prisma, OfferStatus } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { CreateOfferInput, OfferQueryFilters } from "../types/offer.types";

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

export const OfferSelect = {
  id: true,
  offerCode: true,
  companyId: true,
  applicationId: true,
  candidateId: true,
  recruiterId: true,
  version: true,
  status: true,
  salary: true,
  currency: true,
  employmentType: true,
  joiningDate: true,
  expiryDate: true,
  benefits: true,
  notes: true,
  offerLetterUrl: true,
  offerLetterFileName: true,
  approvedBy: true,
  approvedAt: true,
  sentAt: true,
  viewedAt: true,
  respondedAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
  application: {
    select: ApplicationSelect,
  },
  recruiter: {
    select: RecruiterSelect,
  },
  approver: {
    select: RecruiterSelect,
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

export const offerRepository = {
  create: async (
    companyId: string,
    offerCode: string,
    version: number,
    candidateId: string,
    input: CreateOfferInput,
    recruiterId: string,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return await client.offer.create({
      data: {
        offerCode,
        companyId,
        applicationId: input.applicationId,
        candidateId,
        recruiterId,
        version,
        status: OfferStatus.DRAFT,
        salary: input.salary,
        currency: input.currency,
        employmentType: input.employmentType,
        joiningDate: new Date(input.joiningDate),
        expiryDate: new Date(input.expiryDate),
        benefits: input.benefits,
        notes: input.notes,
        offerLetterUrl: input.offerLetterUrl,
        offerLetterFileName: input.offerLetterFileName,
      },
      select: OfferSelect,
    });
  },

  findById: async (id: string, includeDeleted = false, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.offer.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: OfferSelect,
    });
  },

  findActiveOfferByApplication: async (applicationId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.offer.findFirst({
      where: {
        applicationId,
        deletedAt: null,
        status: {
          in: [
            OfferStatus.DRAFT,
            OfferStatus.PENDING_APPROVAL,
            OfferStatus.APPROVED,
            OfferStatus.SENT,
            OfferStatus.VIEWED,
          ],
        },
      },
      select: OfferSelect,
    });
  },

  incrementOfferCounter: async (companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    const counter = await client.companyOfferCounter.upsert({
      where: { companyId },
      update: { count: { increment: 1 } },
      create: { companyId, count: 1 },
    });
    return counter.count;
  },

  update: async (id: string, data: Prisma.OfferUncheckedUpdateInput, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.offer.update({
      where: { id },
      data,
      select: OfferSelect,
    });
  },

  softDelete: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return await client.offer.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: OfferSelect,
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
        candidateId: true,
        status: true,
        stage: true,
        assignedRecruiterId: true,
      },
    });
  },

  findMany: async (companyId: string, filters: OfferQueryFilters, skip: number, take: number, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;

    const where: Prisma.OfferWhereInput = {
      companyId,
      deletedAt: null,
    };

    if (filters.status) where.status = filters.status;
    if (filters.currency) where.currency = filters.currency;
    if (filters.employmentType) where.employmentType = filters.employmentType;
    if (filters.recruiterId) where.recruiterId = filters.recruiterId;

    if (filters.joiningDate) {
      where.joiningDate = buildDateRange(filters.joiningDate);
    }

    if (filters.expiryDate) {
      where.expiryDate = buildDateRange(filters.expiryDate);
    }

    if (filters.createdAt) {
      where.createdAt = buildDateRange(filters.createdAt);
    }

    if (filters.search) {
      const search = filters.search;
      where.OR = [
        { offerCode: { contains: search, mode: "insensitive" } },
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
      ];
    }

    let orderBy: Prisma.OfferOrderByWithRelationInput = {
      createdAt: "desc",
    };

    if (filters.sortBy) {
      const order = filters.sortOrder || "desc";
      if (filters.sortBy === "createdAt") {
        orderBy = { createdAt: order };
      } else if (filters.sortBy === "updatedAt") {
        orderBy = { updatedAt: order };
      } else if (filters.sortBy === "salary") {
        orderBy = { salary: order };
      } else if (filters.sortBy === "joiningDate") {
        orderBy = { joiningDate: order };
      } else if (filters.sortBy === "expiryDate") {
        orderBy = { expiryDate: order };
      }
    }

    const [data, total] = await Promise.all([
      client.offer.findMany({
        where,
        select: OfferSelect,
        orderBy,
        skip,
        take,
      }),
      client.offer.count({
        where,
      }),
    ]);

    return {
      data,
      total,
    };
  },
};
