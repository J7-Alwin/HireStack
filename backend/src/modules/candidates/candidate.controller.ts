import { Request, Response } from "express";
import { HTTP_STATUS } from "../../shared/constants/api.constants";
import { UnauthorizedError } from "../../shared/errors";
import { successResponse } from "../../shared/responses/success.response";
import { paginationResponse } from "../../shared/responses/pagination.response";
import { CANDIDATES_MESSAGES } from "./candidate.constants";
import { candidateService } from "./candidate.service";
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
import {
  createCandidateSchema,
  updateCandidateSchema,
  queryCandidatesSchema,
  candidateIdParamSchema,
  candidateSkillSchema,
  candidateSkillParamSchema,
  candidateEducationSchema,
  candidateEducationParamSchema,
  candidateExperienceSchema,
  candidateExperienceParamSchema,
  candidateDocumentSchema,
  candidateDocumentParamSchema,
  candidateNoteSchema,
  candidateNoteParamSchema,
  candidateTagSchema,
  candidateTagParamSchema,
} from "./candidate.validation";

export const candidateController = {
  createCandidate: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const parsedBody = createCandidateSchema.parse(req.body);
    const result = await candidateService.createCandidate(parsedBody as unknown as CandidateCreateInput, currentUser);

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(CANDIDATES_MESSAGES.CANDIDATE_CREATED, result)
    );
  },

  getCandidateById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const result = await candidateService.getCandidateById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(CANDIDATES_MESSAGES.CANDIDATE_RETRIEVED, result)
    );
  },

  updateCandidate: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = updateCandidateSchema.parse(req.body);
    const result = await candidateService.updateCandidate(id, parsedBody as unknown as CandidateUpdateInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(CANDIDATES_MESSAGES.CANDIDATE_UPDATED, result)
    );
  },

  softDeleteCandidate: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const result = await candidateService.softDeleteCandidate(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(CANDIDATES_MESSAGES.CANDIDATE_DELETED, result)
    );
  },

  restoreCandidate: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const result = await candidateService.restoreCandidate(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(CANDIDATES_MESSAGES.CANDIDATE_RESTORED, result)
    );
  },

  listCandidates: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const parsedQuery = queryCandidatesSchema.parse(req.query);
    const result = await candidateService.listCandidates(parsedQuery as unknown as CandidateQueryFilters, currentUser);

    res.status(HTTP_STATUS.OK).json(
      paginationResponse(CANDIDATES_MESSAGES.CANDIDATES_RETRIEVED, result.data, result.meta)
    );
  },

  // Skills
  addSkill: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = candidateSkillSchema.parse(req.body);
    const result = await candidateService.addSkill(id, parsedBody as unknown as CandidateSkillInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Skill assigned successfully", result)
    );
  },

  updateSkill: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, skillId } = candidateSkillParamSchema.parse(req.params);
    const parsedBody = candidateSkillSchema.omit({ skillId: true }).parse(req.body);
    const result = await candidateService.updateSkill(id, skillId, parsedBody as unknown as Omit<CandidateSkillInput, "skillId">, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Skill proficiency updated successfully", result)
    );
  },

  removeSkill: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, skillId } = candidateSkillParamSchema.parse(req.params);
    const result = await candidateService.removeSkill(id, skillId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Skill removed successfully", result)
    );
  },

  // Education
  addEducation: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = candidateEducationSchema.parse(req.body);
    const result = await candidateService.addEducation(id, parsedBody as unknown as CandidateEducationInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Education record added successfully", result)
    );
  },

  updateEducation: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, educationId } = candidateEducationParamSchema.parse(req.params);
    const parsedBody = candidateEducationSchema.partial().parse(req.body);
    const result = await candidateService.updateEducation(id, educationId, parsedBody as unknown as Partial<CandidateEducationInput>, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Education record updated successfully", result)
    );
  },

  deleteEducation: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, educationId } = candidateEducationParamSchema.parse(req.params);
    const result = await candidateService.deleteEducation(id, educationId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Education record deleted successfully", result)
    );
  },

  // Experience
  addExperience: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = candidateExperienceSchema.parse(req.body);
    const result = await candidateService.addExperience(id, parsedBody as unknown as CandidateExperienceInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Experience record added successfully", result)
    );
  },

  updateExperience: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, experienceId } = candidateExperienceParamSchema.parse(req.params);
    const parsedBody = candidateExperienceSchema.partial().parse(req.body);
    const result = await candidateService.updateExperience(id, experienceId, parsedBody as unknown as Partial<CandidateExperienceInput>, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Experience record updated successfully", result)
    );
  },

  deleteExperience: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, experienceId } = candidateExperienceParamSchema.parse(req.params);
    const result = await candidateService.deleteExperience(id, experienceId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Experience record deleted successfully", result)
    );
  },

  // Documents
  addDocument: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = candidateDocumentSchema.parse(req.body);
    const result = await candidateService.addDocument(id, parsedBody as unknown as CandidateDocumentInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Document registered successfully", result)
    );
  },

  deleteDocument: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, documentId } = candidateDocumentParamSchema.parse(req.params);
    const result = await candidateService.deleteDocument(id, documentId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Document removed successfully", result)
    );
  },

  // Notes
  addNote: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const parsedBody = candidateNoteSchema.parse(req.body);
    const result = await candidateService.addNote(id, parsedBody as unknown as CandidateNoteInput, currentUser);

    res.status(HTTP_STATUS.CREATED).json(
      successResponse("Note added successfully", result)
    );
  },

  updateNote: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, noteId } = candidateNoteParamSchema.parse(req.params);
    const parsedBody = candidateNoteSchema.parse(req.body);
    const result = await candidateService.updateNote(id, noteId, parsedBody as unknown as CandidateNoteInput, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Note updated successfully", result)
    );
  },

  deleteNote: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, noteId } = candidateNoteParamSchema.parse(req.params);
    const result = await candidateService.deleteNote(id, noteId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Note deleted successfully", result)
    );
  },

  // Tags
  assignTag: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id } = candidateIdParamSchema.parse(req.params);
    const { name } = candidateTagSchema.parse(req.body);
    const result = await candidateService.assignTag(id, name, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Tag assigned successfully", result)
    );
  },

  removeTag: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const { id, tagId } = candidateTagParamSchema.parse(req.params);
    const result = await candidateService.removeTag(id, tagId, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse("Tag removed successfully", result)
    );
  },
};
