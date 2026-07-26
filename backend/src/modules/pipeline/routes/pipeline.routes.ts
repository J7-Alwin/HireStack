import { Router } from "express";
import { asyncHandler } from "../../../middleware/async.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { Role } from "../../../shared/enums/role.enum";
import { pipelineController } from "../controllers/pipeline.controller";

const router = Router();

// Enforce authentication on all pipeline routes
router.use(authMiddleware);

// Get dashboard summary (available for recruiters and company admins)
router.get(
  "/dashboard",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.getDashboardSummary)
);

// Get company dashboard metrics (restricted to company admins)
router.get(
  "/dashboard/company",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(pipelineController.getCompanyDashboard)
);

// Get recruiter dashboard metrics (available for recruiters and company admins)
router.get(
  "/dashboard/recruiter",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.getRecruiterDashboard)
);

// Create Hiring Pipeline (normally internal on submission, but exposed for manual setup if needed)
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.createPipeline)
);

// List Hiring Pipelines with filters and search
router.get(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.listPipelines)
);

// Get Pipeline details by ID
router.get(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.getPipelineById)
);

// Move Pipeline stage (or admin overrides)
router.patch(
  "/:id/stage",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.moveStage)
);

// Add notes to a Pipeline candidate
router.post(
  "/:id/notes",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.addNotes)
);

// Get Pipeline history
router.get(
  "/:id/history",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.getHistory)
);

// Get Pipeline activity timeline
router.get(
  "/:id/timeline",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(pipelineController.getTimeline)
);

// Soft delete Hiring Pipeline (restricted to company admins)
router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(pipelineController.softDeletePipeline)
);

export default router;
