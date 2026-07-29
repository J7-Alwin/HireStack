import { Router } from "express";
import { departmentsController } from "./departments.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  listDepartmentsQuerySchema,
  changeStatusSchema,
  departmentIdParamSchema,
} from "./departments.validation";

const router = Router();

// Enforce authentication on all routes
router.use(authMiddleware);

// POST /departments - Create a department
router.post(
  "/",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ body: createDepartmentSchema }),
  asyncHandler(departmentsController.createDepartment)
);

// GET /departments - Search and list departments
router.get(
  "/",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ query: listDepartmentsQuerySchema }),
  asyncHandler(departmentsController.listDepartments)
);

// GET /departments/:id - Get a department profile
router.get(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: departmentIdParamSchema }),
  asyncHandler(departmentsController.getDepartmentById)
);

// PATCH /departments/:id - Update department profile
router.patch(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: departmentIdParamSchema, body: updateDepartmentSchema }),
  asyncHandler(departmentsController.updateDepartment)
);

// PATCH /departments/:id/status - Change department status
router.patch(
  "/:id/status",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: departmentIdParamSchema, body: changeStatusSchema }),
  asyncHandler(departmentsController.changeStatus)
);

// DELETE /departments/:id - Soft delete department
router.delete(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: departmentIdParamSchema }),
  asyncHandler(departmentsController.softDelete)
);

// PATCH /departments/:id/restore - Restore department
router.patch(
  "/:id/restore",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: departmentIdParamSchema }),
  asyncHandler(departmentsController.restore)
);

export default router;
