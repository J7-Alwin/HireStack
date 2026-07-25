import { Router } from "express";
import { jobController } from "./job.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";

const router = Router();

// Enforce authentication on all routes
router.use(authMiddleware);

// GET /jobs - Search and list jobs (SUPER_ADMIN, COMPANY_ADMIN, RECRUITER)
router.get(
  "/",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.listJobs)
);

// GET /jobs/:id - Get complete job details (SUPER_ADMIN, COMPANY_ADMIN, RECRUITER)
router.get(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.getJobById)
);

// POST /jobs - Create a draft job (COMPANY_ADMIN, RECRUITER)
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.createJob)
);

// PATCH /jobs/:id - Update editable job information (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.updateJob)
);

// PATCH /jobs/:id/publish - Publish a draft job (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/publish",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.publishJob)
);

// PATCH /jobs/:id/open - Move published job to OPEN (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/open",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.openJob)
);

// PATCH /jobs/:id/pause - Pause job (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/pause",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.pauseJob)
);

// PATCH /jobs/:id/reopen - Reopen a paused job (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/reopen",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.reopenJob)
);

// PATCH /jobs/:id/close - Close a job (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/close",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.closeJob)
);

// PATCH /jobs/:id/archive - Archive a closed job (COMPANY_ADMIN, RECRUITER)
router.patch(
  "/:id/archive",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(jobController.archiveJob)
);

// Admin-only endpoints (COMPANY_ADMIN)

// PATCH /jobs/:id/restore - Restore a soft-deleted job
router.patch(
  "/:id/restore",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(jobController.restoreJob)
);

// DELETE /jobs/:id - Soft delete a job
router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(jobController.softDeleteJob)
);

// POST /jobs/:id/recruiters - Assign recruiters
router.post(
  "/:id/recruiters",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(jobController.assignRecruiters)
);

// DELETE /jobs/:id/recruiters/:recruiterId - Remove recruiter assignment
router.delete(
  "/:id/recruiters/:recruiterId",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(jobController.removeRecruiter)
);

export default router;
