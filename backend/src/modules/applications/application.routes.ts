import { Router } from "express";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import { applicationController } from "./application.controller";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  createApplicationSchema,
  updateApplicationSchema,
  assignRecruiterSchema,
  updateStageSchema,
  updateStatusSchema,
  rejectApplicationSchema,
  withdrawApplicationSchema,
  queryApplicationsSchema,
  applicationIdParamSchema,
} from "./application.validation";
const router = Router();

// Enforce authentication on all application routes
router.use(authMiddleware);

// Create Application
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({ body: createApplicationSchema }),
  asyncHandler(applicationController.createApplication)
);

// List Applications (paginated, filtered, sorted, searchable)
router.get(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({ query: queryApplicationsSchema }),
  asyncHandler(applicationController.listApplications)
);

// Get Application Details
router.get(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({ params: applicationIdParamSchema }),
  asyncHandler(applicationController.getApplicationById)
);

// Update Editable Details (remarks)
router.patch(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({
    params: applicationIdParamSchema,
    body: updateApplicationSchema,
  }),
  asyncHandler(applicationController.updateApplication)
);

// Assign or Reassign Recruiter (Company Admin only)
router.patch(
  "/:id/assign",
  authorizeRoles(Role.COMPANY_ADMIN),
  validateRequest({
    params: applicationIdParamSchema,
    body: assignRecruiterSchema,
  }),
  asyncHandler(applicationController.assignRecruiter)
);

// Update Application Stage
router.patch(
  "/:id/stage",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({
    params: applicationIdParamSchema,
    body: updateStageSchema,
  }),
  asyncHandler(applicationController.updateStage)
);

// Update Application Status
router.patch(
  "/:id/status",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({
    params: applicationIdParamSchema,
    body: updateStatusSchema,
  }),
  asyncHandler(applicationController.updateStatus)
);

// Reject Application
router.patch(
  "/:id/reject",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({
    params: applicationIdParamSchema,
    body: rejectApplicationSchema,
  }),
  asyncHandler(applicationController.rejectApplication)
);

// Record Candidate Withdrawal
router.patch(
  "/:id/withdraw",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({
    params: applicationIdParamSchema,
    body: withdrawApplicationSchema,
  }),
  asyncHandler(applicationController.withdrawApplication)
);

// Soft Delete Application (Company Admin only)
router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  validateRequest({
    params: applicationIdParamSchema,
  }),
  asyncHandler(applicationController.softDeleteApplication)
);

// Restore Application (Company Admin only)
router.patch(
  "/:id/restore",
  authorizeRoles(Role.COMPANY_ADMIN),
  validateRequest({
    params: applicationIdParamSchema,
  }),
  asyncHandler(applicationController.restoreApplication)
);

export default router;
