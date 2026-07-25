import { prisma } from "../../config/prisma";
import { CandidateStatus, Prisma } from "@prisma/client";
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
  create: async (companyId: string, createdBy: string, candidateCode: string, input: CandidateCreateInput) => {
    return prisma.candidate.create({
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

  findById: async (id: string) => {
    return prisma.candidate.findFirst({
      where: { id, isActive: true },
      include: candidateInclude,
    });
  },

  findByIdIncludeDeleted: async (id: string) => {
    return prisma.candidate.findFirst({
      where: { id },
      include: candidateInclude,
    });
  },

  findByEmailOrPhone: async (companyId: string, email?: string | null, phone?: string | null) => {
    if (!email && !phone) return null;

    const conditions: Prisma.CandidateWhereInput[] = [];
    if (email) conditions.push({ email });
    if (phone) conditions.push({ phone });

    return prisma.candidate.findFirst({
      where: {
        companyId,
        isActive: true,
        OR: conditions,
      },
    });
  },

  findCountByCompany: async (companyId: string) => {
    return prisma.candidate.count({
      where: { companyId },
    });
  },

  update: async (id: string, companyId: string, updatedBy: string, input: CandidateUpdateInput) => {
    return prisma.candidate.update({
      where: { id },
      data: {
        ...input,
        updatedBy,
      },
      include: candidateInclude,
    });
  },

  softDelete: async (id: string, _companyId: string) => {
    return prisma.candidate.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: candidateInclude,
    });
  },

  restore: async (id: string, _companyId: string) => {
    return prisma.candidate.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
      include: candidateInclude,
    });
  },

  list: async (companyId: string, filters: CandidateQueryFilters) => {
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

    // Created Date filter (e.g. "2026-07-25" -> filter by exact day start/end)
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

    // Search query mapping (Candidate Code, First Name, Last Name, Email, Phone, Current Company, Current Designation, Skills, Tags)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      where.OR = [
        { candidateCode: { contains: filters.search, mode: "insensitive" } },
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
        { currentCompany: { contains: filters.search, mode: "insensitive" } },
        { currentDesignation: { contains: filters.search, mode: "insensitive" } },
        {
          skills: {
            some: {
              skill: {
                name: { contains: searchLower, mode: "insensitive" },
              },
            },
          },
        },
        {
          tags: {
            some: {
              tag: {
                name: { contains: searchLower, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    // Sorting
    const orderBy: Prisma.CandidateOrderByWithRelationInput = {};
    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";

    orderBy[sortBy] = sortOrder;

    const [items, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: candidateInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.candidate.count({ where }),
    ]);

    return { items, total };
  },

  // Skills
  findSkillInCatalogue: async (skillId: string) => {
    return prisma.skill.findUnique({
      where: { id: skillId },
    });
  },

  addSkill: async (candidateId: string, input: CandidateSkillInput) => {
    return prisma.candidateSkill.create({
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

  updateSkill: async (candidateId: string, skillId: string, input: Omit<CandidateSkillInput, "skillId">) => {
    return prisma.candidateSkill.update({
      where: {
        candidateId_skillId: { candidateId, skillId },
      },
      data: input,
    });
  },

  removeSkill: async (candidateId: string, skillId: string) => {
    return prisma.candidateSkill.delete({
      where: {
        candidateId_skillId: { candidateId, skillId },
      },
    });
  },

  // Education
  addEducation: async (candidateId: string, input: CandidateEducationInput) => {
    return prisma.candidateEducation.create({
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

  updateEducation: async (id: string, input: Partial<CandidateEducationInput>) => {
    return prisma.candidateEducation.update({
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

  deleteEducation: async (id: string) => {
    return prisma.candidateEducation.delete({
      where: { id },
    });
  },

  // Experience
  addExperience: async (candidateId: string, input: CandidateExperienceInput) => {
    return prisma.candidateExperience.create({
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

  updateExperience: async (id: string, input: Partial<CandidateExperienceInput>) => {
    return prisma.candidateExperience.update({
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

  deleteExperience: async (id: string) => {
    return prisma.candidateExperience.delete({
      where: { id },
    });
  },

  // Documents
  addDocument: async (candidateId: string, uploadedBy: string, input: CandidateDocumentInput) => {
    return prisma.$transaction(async (tx) => {
      // If uploading a resume and marking active, update previous active resumes to inactive
      if (input.documentType === "RESUME" && input.isActive !== false) {
        await tx.candidateDocument.updateMany({
          where: { candidateId, documentType: "RESUME", isActive: true },
          data: { isActive: false },
        });
      }

      return tx.candidateDocument.create({
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
    });
  },

  deleteDocument: async (id: string) => {
    return prisma.candidateDocument.delete({
      where: { id },
    });
  },

  // Notes
  addNote: async (candidateId: string, authorId: string, input: CandidateNoteInput) => {
    return prisma.candidateNote.create({
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

  updateNote: async (id: string, input: CandidateNoteInput) => {
    return prisma.candidateNote.update({
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

  deleteNote: async (id: string) => {
    return prisma.candidateNote.delete({
      where: { id },
    });
  },

  findNoteById: async (id: string) => {
    return prisma.candidateNote.findUnique({
      where: { id },
    });
  },

  // Tags
  findTagByName: async (companyId: string, name: string) => {
    return prisma.tag.findUnique({
      where: {
        companyId_name: { companyId, name: name.toLowerCase() },
      },
    });
  },

  createTag: async (companyId: string, name: string) => {
    return prisma.tag.create({
      data: {
        companyId,
        name: name.toLowerCase(),
      },
    });
  },

  assignTag: async (candidateId: string, tagId: string) => {
    return prisma.candidateTag.create({
      data: {
        candidateId,
        tagId,
      },
    });
  },

  removeTag: async (candidateId: string, tagId: string) => {
    return prisma.candidateTag.delete({
      where: {
        candidateId_tagId: { candidateId, tagId },
      },
    });
  },

  findCandidateTag: async (candidateId: string, tagId: string) => {
    return prisma.candidateTag.findUnique({
      where: {
        candidateId_tagId: { candidateId, tagId },
      },
    });
  },
};
