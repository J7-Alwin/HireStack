import { Router } from "express";
import { recruiterController } from "./recruiter.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import {
  updateRecruiterSchema,
  changeDepartmentSchema,
  listRecruitersQuerySchema,
  recruiterIdParamSchema,
} from "./recruiter.validation";

const router = Router();

// Enforce authentication on all routes
router.use(authMiddleware);

// Restrict all recruiter routes to SUPER_ADMIN and COMPANY_ADMIN roles
router.use(authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN));

// POST /recruiters - Create a recruiter
router.post(
  "/",
  asyncHandler(recruiterController.createRecruiter)
);

// GET /recruiters - Search and list recruiters
router.get(
  "/",
  validateRequest({ query: listRecruitersQuerySchema }),
  asyncHandler(recruiterController.listRecruiters)
);

// GET /recruiters/:id - Get recruiter profile details
router.get(
  "/:id",
  validateRequest({ params: recruiterIdParamSchema }),
  asyncHandler(recruiterController.getRecruiterById)
);

// PATCH /recruiters/:id - Update recruiter details
router.patch(
  "/:id",
  validateRequest({ params: recruiterIdParamSchema, body: updateRecruiterSchema }),
  asyncHandler(recruiterController.updateRecruiter)
);

// PATCH /recruiters/:id/department - Change recruiter department
router.patch(
  "/:id/department",
  validateRequest({ params: recruiterIdParamSchema, body: changeDepartmentSchema }),
  asyncHandler(recruiterController.changeDepartment)
);

// PATCH /recruiters/:id/activate - Activate recruiter
router.patch(
  "/:id/activate",
  validateRequest({ params: recruiterIdParamSchema }),
  asyncHandler(recruiterController.activateRecruiter)
);

// PATCH /recruiters/:id/deactivate - Deactivate recruiter
router.patch(
  "/:id/deactivate",
  validateRequest({ params: recruiterIdParamSchema }),
  asyncHandler(recruiterController.deactivateRecruiter)
);

// DELETE /recruiters/:id - Soft delete recruiter
router.delete(
  "/:id",
  validateRequest({ params: recruiterIdParamSchema }),
  asyncHandler(recruiterController.softDelete)
);

// PATCH /recruiters/:id/restore - Restore recruiter
router.patch(
  "/:id/restore",
  validateRequest({ params: recruiterIdParamSchema }),
  asyncHandler(recruiterController.restore)
);

export default router;
