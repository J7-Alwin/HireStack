import { Router } from "express";
import { companiesController } from "./companies.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { authorizeRoles } from "../../middleware/role.middleware";
import { Role } from "../../shared/enums/role.enum";
import {
  onboardingSchema,
  updateCompanySchema,
  listCompaniesQuerySchema,
  companyIdParamSchema,
  updateCompanyStatusSchema,
} from "./companies.validation";

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

// POST /companies - Company onboarding (SUPER_ADMIN only)
router.post(
  "/",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ body: onboardingSchema }),
  asyncHandler(companiesController.onboardCompany)
);

// GET /companies - Search/list companies (SUPER_ADMIN only)
router.get(
  "/",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ query: listCompaniesQuerySchema }),
  asyncHandler(companiesController.listCompanies)
);

// GET /companies/:id - Retrieve company profile (SUPER_ADMIN and COMPANY_ADMIN)
router.get(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: companyIdParamSchema }),
  asyncHandler(companiesController.getCompanyById)
);

// PATCH /companies/:id - Update company profile (SUPER_ADMIN and COMPANY_ADMIN)
router.patch(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN, Role.COMPANY_ADMIN),
  validateRequest({ params: companyIdParamSchema, body: updateCompanySchema }),
  asyncHandler(companiesController.updateCompany)
);

// PATCH /companies/:id/status - Update company status (SUPER_ADMIN only)
router.patch(
  "/:id/status",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ params: companyIdParamSchema, body: updateCompanyStatusSchema }),
  asyncHandler(companiesController.updateStatus)
);

// DELETE /companies/:id - Soft delete company (SUPER_ADMIN only)
router.delete(
  "/:id",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ params: companyIdParamSchema }),
  asyncHandler(companiesController.softDelete)
);

// PATCH /companies/:id/restore - Restore company (SUPER_ADMIN only)
router.patch(
  "/:id/restore",
  authorizeRoles(Role.SUPER_ADMIN),
  validateRequest({ params: companyIdParamSchema }),
  asyncHandler(companiesController.restore)
);

export default router;
