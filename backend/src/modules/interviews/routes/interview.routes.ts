import { Router } from "express";
import { asyncHandler } from "../../../middleware/async.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { Role } from "../../../shared/enums/role.enum";
import { interviewController } from "../controller/interview.controller";

const router = Router();

// Enforce authentication on all interview routes
router.use(authMiddleware);

// Schedule Interview
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.scheduleInterview)
);

// Get paginated interview list (Search, Filter, Sort, Pagination)
router.get(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.listInterviews)
);

// Get Interview Details
router.get(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.getInterviewById)
);

// Update editable interview information
router.patch(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.updateInterview)
);

// Update interview status
router.patch(
  "/:id/status",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.updateStatus)
);

// Reschedule interview
router.patch(
  "/:id/reschedule",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.rescheduleInterview)
);

// Record interview outcome and recruiter result notes
router.patch(
  "/:id/outcome",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.recordOutcome)
);

// Cancel interview
router.patch(
  "/:id/cancel",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.cancelInterview)
);

// Assign or update interviewers
router.patch(
  "/:id/interviewers",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(interviewController.assignInterviewers)
);

// Soft Delete Interview (Company Admin only)
router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(interviewController.softDeleteInterview)
);

export default router;
