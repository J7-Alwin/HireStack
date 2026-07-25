import { Router } from "express";
import { asyncHandler } from "../../../middleware/async.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { Role } from "../../../shared/enums/role.enum";
import { offerController } from "../controllers/offer.controller";

const router = Router();

// Enforce authentication on all offer routes
router.use(authMiddleware);

// Create Offer
router.post(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.createOffer)
);

// List Offers
router.get(
  "/",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.listOffers)
);

// Get Offer By ID
router.get(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.getOfferById)
);

// Update Draft Offer
router.put(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.updateDraft)
);

// Submit Offer for Approval
router.post(
  "/:id/submit",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.submitForApproval)
);

// Approve Offer
router.post(
  "/:id/approve",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(offerController.approveOffer)
);

// Send Offer to Candidate
router.post(
  "/:id/send",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(offerController.sendOffer)
);

// Mark Offer as Viewed
router.post(
  "/:id/view",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.markViewed)
);

// Candidate Accepts Offer
router.post(
  "/:id/accept",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.acceptOffer)
);

// Candidate Declines Offer
router.post(
  "/:id/decline",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.declineOffer)
);

// Withdraw Offer (Company Admin only)
router.post(
  "/:id/withdraw",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(offerController.withdrawOffer)
);

// Create Offer Revision
router.post(
  "/:id/revision",
  authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
  asyncHandler(offerController.createOfferRevision)
);

// Soft Delete Offer (Company Admin only)
router.delete(
  "/:id",
  authorizeRoles(Role.COMPANY_ADMIN),
  asyncHandler(offerController.softDeleteOffer)
);

export default router;
