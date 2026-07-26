import { Router } from "express";
import { usersController } from "./users.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import {
  listUsersQuerySchema,
  userIdParamSchema,
  updateStatusBodySchema,
} from "./users.validation";

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// GET /users/me - Retrieve current authenticated user
router.get("/me", asyncHandler(usersController.getMe));

// GET /users - List users with query filters (SUPER_ADMIN and COMPANY_ADMIN only)
router.get(
  "/",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ query: listUsersQuerySchema }),
  asyncHandler(usersController.listUsers)
);

// GET /users/:id - Retrieve user details by ID
router.get(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN, Role.RECRUITER),
  validateRequest({ params: userIdParamSchema }),
  asyncHandler(usersController.getUserById)
);

// PATCH /users/:id/status - Update user status
router.patch(
  "/:id/status",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: userIdParamSchema, body: updateStatusBodySchema }),
  asyncHandler(usersController.updateStatus)
);

// DELETE /users/:id - Soft delete a user (SUPER_ADMIN only)
router.delete(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ params: userIdParamSchema }),
  asyncHandler(usersController.softDelete)
);

// PATCH /users/:id/restore - Restore a soft-deleted user (SUPER_ADMIN only)
router.patch(
  "/:id/restore",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ params: userIdParamSchema }),
  asyncHandler(usersController.restore)
);

export default router;
