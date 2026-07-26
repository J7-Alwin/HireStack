import { prisma } from "../../config/prisma";
import { CandidateStatus, Prisma, Role } from "@prisma/client";
import {
  CandidateCreateInput,
  CandidateUpdateInput,
  CandidateQueryFilters,
  CandidateSkillInput,
  CandidateEducationInput,
  CandidateExperienceInput,
  CandidateDocumentInput,
  CandidateNoteInput,
} from "./candidate.types";

const candidateInclude = {
  creator: {
    select: { id: true, name: true, email: true },
  },
  primaryRecruiter: {
    select: { id: true, name: true, email: true, designation: true },
  },
  updater: {
    select: { id: true, name: true, email: true },
  },
  skills: {
    include: {
      skill: {
        select: { id: true, name: true },
      },
    },
  },
  education: true,
  experience: true,
  documents: true,
  notes: {
    include: {
      author: {
        select: { id: true, name: true },
      },
    },
    orderBy: {
      createdAt: "desc" as const,
    },
  },
  tags: {
    include: {
      tag: {
        select: { id: true, name: true },
      },
    },
  },
};

export const candidateRepository = {
  findRecruiterById: async (id: string, companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.user.findFirst({
      where: { id, companyId, role: Role.RECRUITER },
    });
  },

  incrementCandidateCounter: async (companyId: string, tx: Prisma.TransactionClient) => {
    const counter = await tx.companyCandidateCounter.upsert({
      where: { companyId },
      update: { count: { increment: 1 } },
      create: { companyId, count: 1 },
    });
    return counter.count;
  },

  create: async (
    companyId: string,
    createdBy: string,
    candidateCode: string,
    input: CandidateCreateInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidate.create({
      data: {
        ...input,
        candidateCode,
        companyId,
        createdBy,
        status: CandidateStatus.ACTIVE,
      },
      include: candidateInclude,
    });
  },

  findById: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidate.findFirst({
      where: { id, isActive: true },
      include: candidateInclude,
    });
  },

  findByIdIncludeDeleted: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidate.findFirst({
      where: { id },
      include: candidateInclude,
    });
  },

  findByEmailOrPhone: async (
    companyId: string,
    email?: string | null,
    phone?: string | null,
    tx?: Prisma.TransactionClient
  ) => {
    if (!email && !phone) return null;

    const client = tx || prisma;
    const conditions: Prisma.CandidateWhereInput[] = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    return client.candidate.findFirst({
      where: {
        companyId,
        isActive: true,
        OR: conditions,
      },
    });
  },

  findCountByCompany: async (companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidate.count({
      where: { companyId },
    });
  },

  update: async (
    id: string,
    companyId: string,
    updatedBy: string,
    input: CandidateUpdateInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidate.update({
      where: { id },
      data: {
        ...input,
        updatedBy,
      },
      include: candidateInclude,
    });
  },

  softDelete: async (id: string, _companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidate.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: candidateInclude,
    });
  },

  restore: async (id: string, _companyId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidate.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
      include: candidateInclude,
    });
  },

  list: async (
    companyId: string,
    filters: CandidateQueryFilters,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CandidateWhereInput = {
      companyId,
      isActive: true,
    };

    // Recruiter filter
    if (filters.recruiter) {
      where.primaryRecruiterId = filters.recruiter;
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status;
    }

    // Employment Status filter
    if (filters.employmentStatus) {
      where.employmentStatus = filters.employmentStatus;
    }

    // Source filter
    if (filters.source) {
      where.source = filters.source;
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      where.skills = {
        some: {
          skillId: { in: filters.skills },
        },
      };
    }

    // Experience ranges
    if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) {
      where.experienceYears = {};
      if (filters.experienceMin !== undefined) {
        where.experienceYears.gte = filters.experienceMin;
      }
      if (filters.experienceMax !== undefined) {
        where.experienceYears.lte = filters.experienceMax;
      }
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: filters.tags.map((t) => t.toLowerCase()) },
          },
        },
      };
    }

    // Created Date filter
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

    // Search query mapping optimized by performing pre-lookups to avoid large OR joins
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();

      // Perform quick pre-lookups on related tables
      const [matchingSkills, matchingTags] = await Promise.all([
        client.skill.findMany({
          where: { name: { contains: searchLower, mode: "insensitive" } },
          select: { id: true },
        }),
        client.tag.findMany({
          where: { companyId, name: { contains: searchLower, mode: "insensitive" } },
          select: { id: true },
        }),
      ]);

      const conditions: Prisma.CandidateWhereInput[] = [
        { candidateCode: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { currentCompany: { contains: filters.search, mode: "insensitive" } },
        { currentDesignation: { contains: filters.search, mode: "insensitive" } },
      ];

      if (matchingSkills.length > 0) {
        conditions.push({
          skills: {
            some: {
              skillId: { in: matchingSkills.map((s) => s.id) },
            },
          },
        });
      }

      if (matchingTags.length > 0) {
        conditions.push({
          tags: {
            some: {
              tagId: { in: matchingTags.map((t) => t.id) },
            },
          },
        });
      }

      where.OR = conditions;
    }

    // Sorting
    const orderBy: Prisma.CandidateOrderByWithRelationInput = {};
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    orderBy[sortBy] = sortOrder;

    const [items, total] = await Promise.all([
      client.candidate.findMany({
        where,
        include: candidateInclude,
        orderBy,
        skip,
        take: limit,
      }),
      client.candidate.count({ where }),
    ]);

    return { items, total };
  },

  // Skills
  findSkillInCatalogue: async (skillId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.skill.findUnique({
      where: { id: skillId },
    });
  },

  addSkill: async (
    candidateId: string,
    input: CandidateSkillInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateSkill.create({
      data: {
        candidateId,
        skillId: input.skillId,
        proficiency: input.proficiency,
        experienceYears: input.experienceYears,
        experienceMonths: input.experienceMonths,
        isPrimary: input.isPrimary,
      },
    });
  },

  updateSkill: async (
    candidateId: string,
    skillId: string,
    input: Omit<CandidateSkillInput, "skillId">,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateSkill.update({
      where: {
        candidateId_skillId: { candidateId, skillId },
      },
      data: input,
    });
  },

  removeSkill: async (candidateId: string, skillId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateSkill.delete({
      where: {
        candidateId_skillId: { candidateId, skillId },
      },
    });
  },

  // Education
  addEducation: async (
    candidateId: string,
    input: CandidateEducationInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateEducation.create({
      data: {
        candidateId,
        degree: input.degree,
        specialization: input.specialization,
        institution: input.institution,
        university: input.university,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        graduationYear: input.graduationYear,
        grade: input.grade,
        isHighest: input.isHighest,
      },
    });
  },

  updateEducation: async (
    id: string,
    input: Partial<CandidateEducationInput>,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateEducation.update({
      where: { id },
      data: {
        degree: input.degree,
        specialization: input.specialization,
        institution: input.institution,
        university: input.university,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        graduationYear: input.graduationYear,
        grade: input.grade,
        isHighest: input.isHighest,
      },
    });
  },

  deleteEducation: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateEducation.delete({
      where: { id },
    });
  },

  // Experience
  addExperience: async (
    candidateId: string,
    input: CandidateExperienceInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateExperience.create({
      data: {
        candidateId,
        company: input.company,
        designation: input.designation,
        employmentType: input.employmentType,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        isCurrent: input.isCurrent,
        description: input.description,
      },
    });
  },

  updateExperience: async (
    id: string,
    input: Partial<CandidateExperienceInput>,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateExperience.update({
      where: { id },
      data: {
        company: input.company,
        designation: input.designation,
        employmentType: input.employmentType,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        isCurrent: input.isCurrent,
        description: input.description,
      },
    });
  },

  deleteExperience: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateExperience.delete({
      where: { id },
    });
  },

  // Documents
  addDocument: async (
    candidateId: string,
    uploadedBy: string,
    input: CandidateDocumentInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    // If uploading a resume and marking active, update previous active resumes to inactive
    if (input.documentType === "RESUME" && input.isActive !== false) {
      await client.candidateDocument.updateMany({
        where: { candidateId, documentType: "RESUME", isActive: true },
        data: { isActive: false },
      });
    }

    return client.candidateDocument.create({
      data: {
        candidateId,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        fileSize: input.fileSize,
        mimeType: input.mimeType,
        documentType: input.documentType,
        isActive: input.isActive,
        uploadedBy,
      },
    });
  },

  deleteDocument: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateDocument.delete({
      where: { id },
    });
  },

  // Notes
  addNote: async (
    candidateId: string,
    authorId: string,
    input: CandidateNoteInput,
    tx?: Prisma.TransactionClient
  ) => {
    const client = tx || prisma;
    return client.candidateNote.create({
      data: {
        candidateId,
        authorId,
        content: input.content,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
  },

  updateNote: async (id: string, input: CandidateNoteInput, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateNote.update({
      where: { id },
      data: {
        content: input.content,
      },
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
    });
  },

  deleteNote: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateNote.delete({
      where: { id },
    });
  },

  findNoteById: async (id: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateNote.findUnique({
      where: { id },
    });
  },

  // Tags
  findTagByName: async (companyId: string, name: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.tag.findUnique({
      where: {
        companyId_name: { companyId, name: name.toLowerCase() },
      },
    });
  },

  createTag: async (companyId: string, name: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.tag.create({
      data: {
        companyId,
        name: name.toLowerCase(),
      },
    });
  },

  assignTag: async (candidateId: string, tagId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateTag.create({
      data: {
        candidateId,
        tagId,
      },
    });
  },

  removeTag: async (candidateId: string, tagId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateTag.delete({
      where: {
        candidateId_tagId: { candidateId, tagId },
      },
    });
  },

  findCandidateTag: async (candidateId: string, tagId: string, tx?: Prisma.TransactionClient) => {
    const client = tx || prisma;
    return client.candidateTag.findUnique({
      where: {
        candidateId_tagId: { candidateId, tagId },
      },
    });
  },
};
