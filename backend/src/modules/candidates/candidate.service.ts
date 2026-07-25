import { Role, CandidateStatus } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ForbiddenError, NotFoundError, ConflictError, UnprocessableEntityError } from "../../shared/errors";
import { AuthenticatedUser } from "../../shared/types";
import { CANDIDATES_MESSAGES } from "./candidate.constants";
import { candidateRepository } from "./candidate.repository";
import {
  createCandidateSchema,
  updateCandidateSchema,
  candidateSkillSchema,
  candidateEducationSchema,
  candidateEducationUpdateSchema,
  candidateExperienceSchema,
  candidateExperienceUpdateSchema,
  candidateDocumentSchema,
  candidateNoteSchema,
  candidateTagSchema,
} from "./candidate.validation";
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
  createCandidate: async (
    input: CandidateCreateInput & {
      skills?: CandidateSkillInput[];
      education?: CandidateEducationInput[];
      experience?: CandidateExperienceInput[];
      documents?: CandidateDocumentInput[];
      notes?: CandidateNoteInput[];
      tags?: string[];
    },
    currentUser: AuthenticatedUser
  ) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    // Perform Zod validation on service input
    const parsedInput = createCandidateSchema.parse(input);

    // Recruiter role validation: Recruiters must assign candidate to themselves
    if (currentUser.role === Role.RECRUITER) {
      if (parsedInput.primaryRecruiterId !== currentUser.id) {
        throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_MODIFICATION);
      }
    }

    // Wrap counter checks, duplicate checks, candidate creation and nested records inside transaction
    return prisma.$transaction(async (tx) => {
      // Verify primary recruiter user exists in same company and is RECRUITER
      const recruiterUser = await candidateRepository.findRecruiterById(parsedInput.primaryRecruiterId, companyId, tx);
      if (!recruiterUser) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_NOT_FOUND);
      }
      if (recruiterUser.role !== Role.RECRUITER) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_ROLE_INVALID);
      }

      // Duplicate detection on email or phone
      const duplicate = await candidateRepository.findByEmailOrPhone(companyId, parsedInput.email, parsedInput.phone, tx);
      if (duplicate) {
        if (parsedInput.email && duplicate.email === parsedInput.email) {
          throw new ConflictError(CANDIDATES_MESSAGES.EMAIL_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
        if (parsedInput.phone && duplicate.phone === parsedInput.phone) {
          throw new ConflictError(CANDIDATES_MESSAGES.PHONE_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
      }

      // Concurrency-safe atomic Candidate Code generation using the counter table
      const codeCount = await candidateRepository.incrementCandidateCounter(companyId, tx);
      const candidateCode = `CAN-${String(codeCount).padStart(5, "0")}`;

      const { skills, education, experience, documents, notes, tags, ...candidateData } = parsedInput;

      // 1. Create base candidate profile
      const candidate = await candidateRepository.create(companyId, currentUser.id, candidateCode, candidateData, tx);

      // 2. Add skills
      if (skills && skills.length > 0) {
        for (const skill of skills) {
          const catalogueSkill = await candidateRepository.findSkillInCatalogue(skill.skillId, tx);
          if (!catalogueSkill) {
            throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_CATALOGUE_NOT_FOUND);
          }
          await candidateRepository.addSkill(candidate.id, skill, tx);
        }
      }

      // 3. Add education records
      if (education && education.length > 0) {
        for (const edu of education) {
          await candidateRepository.addEducation(candidate.id, edu, tx);
        }
      }

      // 4. Add experience records
      if (experience && experience.length > 0) {
        for (const exp of experience) {
          await candidateRepository.addExperience(candidate.id, exp, tx);
        }
      }

      // 5. Add documents (Resume deactivations will run automatically per resume within transaction)
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          await candidateRepository.addDocument(candidate.id, currentUser.id, doc, tx);
        }
      }

      // 6. Add notes
      if (notes && notes.length > 0) {
        for (const note of notes) {
          await candidateRepository.addNote(candidate.id, currentUser.id, note, tx);
        }
      }

      // 7. Add tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          let tag = await candidateRepository.findTagByName(companyId, tagName, tx);
          if (!tag) {
            tag = await candidateRepository.createTag(companyId, tagName, tx);
          }
          await candidateRepository.assignTag(candidate.id, tag.id, tx);
        }
      }

      // Return fully loaded candidate profile
      const finalCandidate = await candidateRepository.findById(candidate.id, tx);
      if (!finalCandidate) {
        throw new NotFoundError(CANDIDATES_MESSAGES.CANDIDATE_NOT_FOUND);
      }
      return finalCandidate;
    }, {
      maxWait: 15000,
      timeout: 30000,
    });
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

    const parsedInput = updateCandidateSchema.parse(input);

    // If recruiter tries to reassign the primary recruiter, reject it
    if (currentUser.role === Role.RECRUITER && parsedInput.primaryRecruiterId && parsedInput.primaryRecruiterId !== candidate.primaryRecruiterId) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.FORBIDDEN_MODIFICATION);
    }

    // Verify updated primary recruiter if provided (uses repository wrapper)
    if (parsedInput.primaryRecruiterId) {
      const recruiterUser = await candidateRepository.findRecruiterById(parsedInput.primaryRecruiterId, companyId);
      if (!recruiterUser) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_NOT_FOUND);
      }
      if (recruiterUser.role !== Role.RECRUITER) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.RECRUITER_ROLE_INVALID);
      }
    }

    // Duplicate detection on updated contact details
    if (parsedInput.email || parsedInput.phone) {
      const duplicate = await candidateRepository.findByEmailOrPhone(companyId, parsedInput.email, parsedInput.phone);
      if (duplicate && duplicate.id !== id) {
        if (parsedInput.email && duplicate.email === parsedInput.email) {
          throw new ConflictError(CANDIDATES_MESSAGES.EMAIL_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
        if (parsedInput.phone && duplicate.phone === parsedInput.phone) {
          throw new ConflictError(CANDIDATES_MESSAGES.PHONE_ALREADY_EXISTS, { duplicateId: duplicate.id });
        }
      }
    }

    // Status transition rules
    if (parsedInput.status) {
      // 1. Cannot transition to ARCHIVED directly on update (use archive API / soft delete)
      if (parsedInput.status === CandidateStatus.ARCHIVED && candidate.status !== CandidateStatus.ARCHIVED) {
        throw new UnprocessableEntityError(CANDIDATES_MESSAGES.INVALID_STATUS_TRANSITION);
      }

      // 2. Blacklisted transition checks
      if (candidate.status === CandidateStatus.BLACKLISTED && parsedInput.status !== CandidateStatus.BLACKLISTED) {
        if (currentUser.role !== Role.COMPANY_ADMIN) {
          throw new ForbiddenError(CANDIDATES_MESSAGES.BLACKLISTED_TRANSITION_FORBIDDEN);
        }
      }
    }

    return candidateRepository.update(id, companyId, currentUser.id, parsedInput);
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

    const parsedInput = candidateSkillSchema.parse(input);

    // Verify skill exists in catalogue
    const catalogueSkill = await candidateRepository.findSkillInCatalogue(parsedInput.skillId);
    if (!catalogueSkill) {
      throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_CATALOGUE_NOT_FOUND);
    }

    // Check duplicate skill assignment
    const alreadyAssigned = candidate.skills.some((s) => s.skillId === parsedInput.skillId);
    if (alreadyAssigned) {
      throw new ConflictError(CANDIDATES_MESSAGES.SKILL_ALREADY_EXISTS);
    }

    await candidateRepository.addSkill(candidateId, parsedInput);
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

    const parsedInput = candidateSkillSchema.omit({ skillId: true }).parse(input);

    const hasSkill = candidate.skills.some((s) => s.skillId === skillId);
    if (!hasSkill) {
      throw new NotFoundError(CANDIDATES_MESSAGES.SKILL_NOT_FOUND);
    }

    await candidateRepository.updateSkill(candidateId, skillId, parsedInput);
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

    const parsedInput = candidateEducationSchema.parse(input);

    await candidateRepository.addEducation(candidateId, parsedInput);
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

    const parsedInput = candidateEducationUpdateSchema.parse(input);

    const hasEducation = candidate.education.some((e) => e.id === educationId);
    if (!hasEducation) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EDUCATION_NOT_FOUND);
    }

    await candidateRepository.updateEducation(educationId, parsedInput);
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

    const parsedInput = candidateExperienceSchema.parse(input);

    await candidateRepository.addExperience(candidateId, parsedInput);
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

    const parsedInput = candidateExperienceUpdateSchema.parse(input);

    const hasExperience = candidate.experience.some((e) => e.id === experienceId);
    if (!hasExperience) {
      throw new NotFoundError(CANDIDATES_MESSAGES.EXPERIENCE_NOT_FOUND);
    }

    await candidateRepository.updateExperience(experienceId, parsedInput);
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

    const parsedInput = candidateDocumentSchema.parse(input);

    await candidateRepository.addDocument(candidateId, currentUser.id, parsedInput);
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

    const parsedInput = candidateNoteSchema.parse(input);

    return candidateRepository.addNote(candidateId, currentUser.id, parsedInput);
  },

  updateNote: async (candidateId: string, noteId: string, input: CandidateNoteInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    await validateCandidateExists(candidateId, currentUser);

    const parsedInput = candidateNoteSchema.parse(input);

    const note = await candidateRepository.findNoteById(noteId);
    if (!note || note.candidateId !== candidateId) {
      throw new NotFoundError(CANDIDATES_MESSAGES.NOTE_NOT_FOUND);
    }

    // Owner check: Recruiters can only modify notes they authored themselves
    if (currentUser.role === Role.RECRUITER && note.authorId !== currentUser.id) {
      throw new ForbiddenError(CANDIDATES_MESSAGES.NOTE_AUTHOR_MISMATCH);
    }

    return candidateRepository.updateNote(noteId, parsedInput);
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

    const parsedInput = candidateTagSchema.parse({ name: tagName });

    // Find or create Tag
    let tag = await candidateRepository.findTagByName(currentUser.companyId!, parsedInput.name);
    if (!tag) {
      tag = await candidateRepository.createTag(currentUser.companyId!, parsedInput.name);
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
