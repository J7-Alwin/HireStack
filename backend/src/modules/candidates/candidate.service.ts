import { Role, CandidateStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ForbiddenError, NotFoundError, ConflictError, UnprocessableEntityError } from "../../shared/errors";
import { AuthenticatedUser } from "../../shared/types";
import { CANDIDATES_MESSAGES } from "./candidate.constants";
import { candidateRepository } from "./candidate.repository";
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

// Role-based helper to enforce candidate ownership and company scope
function validateCompanyAccess(candidateCompanyId: string, currentUser: AuthenticatedUser) {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (candidateCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(CANDIDATES_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

function enforceWriterRole(currentUser: AuthenticatedUser) {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
  }
}

async function validateCandidateExists(id: string, currentUser: AuthenticatedUser) {
  const candidate = await candidateRepository.findById(id);
  if (!candidate) {
    throw new NotFoundError(CANDIDATES_MESSAGES.CANDIDATE_NOT_FOUND);
  }
  validateCompanyAccess(candidate.companyId, currentUser);
  return candidate;
}

export const candidateService = {
  createCandidate: async (input: CandidateCreateInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    // Recruiter role validation: Recruiters must assign candidate to themselves
    if (currentUser.role === Role.RECRUITER) {
      if (input.primaryRecruiterId !== currentUser.id) {
        throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    }

    // Verify primary recruiter user exists in same company and is RECRUITER
    const recruiterUser = await prisma.user.findFirst({
      where: { id: input.primaryRecruiterId, companyId },
    });
    if (!recruiterUser) {
      throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_NOT_FOUND);
    }
    if (recruiterUser.role !== Role.RECRUITER) {
      throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_ROLE_INVALID);
    }

    // Duplicate detection on email or phone
    const duplicate = await candidateRepository.findByEmailOrPhone(companyId, input.email, input.phone);
    if (duplicate) {
      if (input.email && duplicate.email === input.email) {
        throw new ConflictError(CANDIDATES_MESSAGES.EMAIL_ALREADY_EXISTS, { duplicateId: duplicate.id });
      }
      if (input.phone && duplicate.phone === input.phone) {
        throw new ConflictError(CANDIDATES_MESSAGES.PHONE_ALREADY_EXISTS, { duplicateId: duplicate.id });
      }
    }

    // Candidate Code generation (e.g. CAN-00042)
    const count = await candidateRepository.findCountByCompany(companyId);
    const candidateCode = `CAN-${String(count + 1).padStart(5, "0")}`;

    return candidateRepository.create(companyId, currentUser.id, candidateCode, input);
  },

  getCandidateById: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
    }
    return validateCandidateExists(id, currentUser);
  },

  updateCandidate: async (id: string, input: CandidateUpdateInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;
    const candidate = await validateCandidateExists(id, currentUser);

    // If recruiter tries to reassign the primary recruiter, reject it
    if (currentUser.role === Role.RECRUITER && input.primaryRecruiterId && input.primaryRecruiterId !== candidate.primaryRecruiterId) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    // Verify updated primary recruiter if provided
    if (input.primaryRecruiterId) {
      const recruiterUser = await prisma.user.findFirst({
        where: { id: input.primaryRecruiterId, companyId },
      });
      if (!recruiterUser) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_NOT_FOUND);
      }
      if (recruiterUser.role !== Role.RECRUITER) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_ROLE_INVALID);
      }
    }

    // Duplicate detection on updated contact details
    if (input.email || input.phone) {
      const duplicate = await candidateRepository.findByEmailOrPhone(companyId, input.email, input.phone);
      if (duplicate && duplicate.id !== id) {
        if (input.email && duplicate.email === input.email) {
          throw new ConflictError(CANDIDATES_MESSAGES.EMAIL_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
        if (input.phone && duplicate.phone === input.phone) {
          throw new ConflictError(CANDIDATES_MESSAGES.PHONE_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
      }
    }

    // Status transition rules
    if (input.status) {
      // 1. Cannot transition to ARCHIVED directly on update (use archive API / soft delete)
      if (input.status === CandidateStatus.ARCHIVED && candidate.status !== CandidateStatus.ARCHIVED) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.INVALID_STATUS_TRANSITION);
      }

      // 2. Blacklisted transition checks
      if (candidate.status === CandidateStatus.BLACKLISTED && input.status !== CandidateStatus.BLACKLISTED) {
        if (currentUser.role !== Role.COMPANY_ADMIN) {
          throw new ForbiddenError(CANDIDATES_MESSAGES.BLACKLISTED_TRANSITION_FORBIDDEN);
        }
      }
    }

    return candidateRepository.update(id, companyId, currentUser.id, input);
  },

  softDeleteCandidate: async (id: string, currentUser: AuthenticatedUser) => {
    // Only Company Admin can delete candidates
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const candidate = await validateCandidateExists(id, currentUser);

    // Cannot delete already deleted
    if (!candidate.isActive) {
      throw new UnprocessableEntityError(CANDIDATES_MESSAGES.CANNOT_DELETE_DELETED);
    }

    // Set candidate status to ARCHIVED alongside soft delete
    await candidateRepository.update(id, companyId, currentUser.id, { status: CandidateStatus.ARCHIVED });
    return candidateRepository.softDelete(id, companyId);
  },

  restoreCandidate: async (id: string, currentUser: AuthenticatedUser) => {
    // Only Company Admin can restore candidates
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    
    // Find candidate including deleted
    const candidate = await candidateRepository.findByIdIncludeDeleted(id);
    if (!candidate) {
      throw new NotFoundError(CANDIDATES_MESSAGES.CANDIDATE_NOT_FOUND);
    }
    validateCompanyAccess(candidate.companyId, currentUser);

    if (candidate.isActive) {
      throw new UnprocessableEntityError(CANDIDATES_MESSAGES.CANNOT_RESTORE_ACTIVE);
    }

    // Set candidate status to ACTIVE on restore
    await candidateRepository.update(id, companyId, currentUser.id, { status: CandidateStatus.ACTIVE });
    return candidateRepository.restore(id, companyId);
  },

  listCandidates: async (filters: CandidateQueryFilters, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const { items, total } = await candidateRepository.list(companyId, filters);
    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Skills
  addSkill: async (candidateId: string, input: CandidateSkillInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    // Verify skill exists in catalogue
    const catalogueSkill = await candidateRepository.findSkillInCatalogue(input.skillId);
    if (!catalogueSkill) {
      throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_CATALOGUE_NOT_FOUND);
    }

    // Check duplicate skill assignment
    const alreadyAssigned = candidate.skills.some((s) => s.skillId === input.skillId);
    if (alreadyAssigned) {
      throw new ConflictError(CANDIDATES_MESSAGES.SKILL_ALREADY_EXISTS);
    }

    await candidateRepository.addSkill(candidateId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  updateSkill: async (
    candidateId: string,
    skillId: string,
    input: Omit<CandidateSkillInput, "skillId">,
    currentUser: AuthenticatedUser
  ) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasSkill = candidate.skills.some((s) => s.skillId === skillId);
    if (!hasSkill) {
      throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_NOT_FOUND);
    }

    await candidateRepository.updateSkill(candidateId, skillId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  removeSkill: async (candidateId: string, skillId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasSkill = candidate.skills.some((s) => s.skillId === skillId);
    if (!hasSkill) {
      throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_NOT_FOUND);
    }

    await candidateRepository.removeSkill(candidateId, skillId);
    return validateCandidateExists(candidateId, currentUser);
  },

  // Education
  addEducation: async (candidateId: string, input: CandidateEducationInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    await candidateRepository.addEducation(candidateId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  updateEducation: async (
    candidateId: string,
    educationId: string,
    input: Partial<CandidateEducationInput>,
    currentUser: AuthenticatedUser
  ) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasEducation = candidate.education.some((e) => e.id === educationId);
    if (!hasEducation) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EDUCATION_NOT_FOUND);
    }

    await candidateRepository.updateEducation(educationId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  deleteEducation: async (candidateId: string, educationId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasEducation = candidate.education.some((e) => e.id === educationId);
    if (!hasEducation) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EDUCATION_NOT_FOUND);
    }

    await candidateRepository.deleteEducation(educationId);
    return validateCandidateExists(candidateId, currentUser);
  },

  // Experience
  addExperience: async (candidateId: string, input: CandidateExperienceInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    await candidateRepository.addExperience(candidateId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  updateExperience: async (
    candidateId: string,
    experienceId: string,
    input: Partial<CandidateExperienceInput>,
    currentUser: AuthenticatedUser
  ) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasExperience = candidate.experience.some((e) => e.id === experienceId);
    if (!hasExperience) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EXPERIENCE_NOT_FOUND);
    }

    await candidateRepository.updateExperience(experienceId, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  deleteExperience: async (candidateId: string, experienceId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasExperience = candidate.experience.some((e) => e.id === experienceId);
    if (!hasExperience) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EXPERIENCE_NOT_FOUND);
    }

    await candidateRepository.deleteExperience(experienceId);
    return validateCandidateExists(candidateId, currentUser);
  },

  // Documents
  addDocument: async (candidateId: string, input: CandidateDocumentInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    await candidateRepository.addDocument(candidateId, currentUser.id, input);
    return validateCandidateExists(candidateId, currentUser);
  },

  deleteDocument: async (candidateId: string, documentId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasDoc = candidate.documents.some((d) => d.id === documentId);
    if (!hasDoc) {
      throw new NotFoundError(CANDIDATES_MESSAGES.DOCUMENT_NOT_FOUND);
    }

    await candidateRepository.deleteDocument(documentId);
    return validateCandidateExists(candidateId, currentUser);
  },

  // Notes
  addNote: async (candidateId: string, input: CandidateNoteInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    return candidateRepository.addNote(candidateId, currentUser.id, input);
  },

  updateNote: async (candidateId: string, noteId: string, input: CandidateNoteInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    const note = await candidateRepository.findNoteById(noteId);
    if (!note || note.candidateId !== candidateId) {
      throw new NotFoundError(CANDIDATES_MESSAGES.NOTE_NOT_FOUND);
    }

    // Owner check: Recruiters can only modify notes they authored themselves
    if (currentUser.role === Role.RECRUITER && note.authorId !== currentUser.id) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.NOTE_AUTHOR_MISMATCH);
    }

    return candidateRepository.updateNote(noteId, input);
  },

  deleteNote: async (candidateId: string, noteId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    const note = await candidateRepository.findNoteById(noteId);
    if (!note || note.candidateId !== candidateId) {
      throw new NotFoundError(CANDIDATES_MESSAGES.NOTE_NOT_FOUND);
    }

    // Owner check
    if (currentUser.role === Role.RECRUITER && note.authorId !== currentUser.id) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.NOTE_AUTHOR_MISMATCH);
    }

    return candidateRepository.deleteNote(noteId);
  },

  // Tags
  assignTag: async (candidateId: string, tagName: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    // Find or create Tag
    let tag = await candidateRepository.findTagByName(currentUser.companyId!, tagName);
    if (!tag) {
      tag = await candidateRepository.createTag(currentUser.companyId!, tagName);
    }

    // Check duplicate assignment
    const alreadyAssigned = candidate.tags.some((t) => t.tagId === tag.id);
    if (!alreadyAssigned) {
      await candidateRepository.assignTag(candidateId, tag.id);
    }

    return validateCandidateExists(candidateId, currentUser);
  },

  removeTag: async (candidateId: string, tagId: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const candidate = await validateCandidateExists(candidateId, currentUser);

    const hasTag = candidate.tags.some((t) => t.tagId === tagId);
    if (!hasTag) {
      throw new NotFoundError(CANDIDATES_MESSAGES.TAG_NOT_FOUND);
    }

    await candidateRepository.removeTag(candidateId, tagId);
    return validateCandidateExists(candidateId, currentUser);
  },
};
