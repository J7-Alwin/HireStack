import { Router } from "express";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import { candidateController } from "./candidate.controller";

const router = Router();

// Enforce authentication on all candidate routes
router.use(authMiddleware);

// Candidate CRUD
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.createCandidate)
);

router.get(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.listCandidates)
);

router.get(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.getCandidateById)
);

router.patch(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.updateCandidate)
);

router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(candidateController.softDeleteCandidate)
);

router.patch(
  "/:id/restore",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(candidateController.restoreCandidate)
);

// Skills
router.post(
  "/:id/skills",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.addSkill)
);

router.patch(
  "/:id/skills/:skillId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.updateSkill)
);

router.delete(
  "/:id/skills/:skillId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.removeSkill)
);

// Education
router.post(
  "/:id/education",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.addEducation)
);

router.patch(
  "/:id/education/:educationId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.updateEducation)
);

router.delete(
  "/:id/education/:educationId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.deleteEducation)
);

// Experience
router.post(
  "/:id/experience",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.addExperience)
);

router.patch(
  "/:id/experience/:experienceId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.updateExperience)
);

router.delete(
  "/:id/experience/:experienceId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.deleteExperience)
);

// Documents
router.post(
  "/:id/documents",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.addDocument)
);

router.delete(
  "/:id/documents/:documentId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.deleteDocument)
);

// Notes
router.post(
  "/:id/notes",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.addNote)
);

router.patch(
  "/:id/notes/:noteId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.updateNote)
);

router.delete(
  "/:id/notes/:noteId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.deleteNote)
);

// Tags
router.post(
  "/:id/tags",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.assignTag)
);

router.delete(
  "/:id/tags/:tagId",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(candidateController.removeTag)
);

export default router;
