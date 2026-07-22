import { Router } from "express";
import { authController } from "./auth.controller";
import { asyncHandler } from "../../middleware/async.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  refreshTokenSchema,
} from "./auth.validation";

const router = Router();

router.post("/login", validateRequest({ body: loginSchema }), asyncHandler(authController.login));
router.post("/logout", validateRequest({ body: refreshTokenSchema }), asyncHandler(authController.logout));
router.post("/refresh-token", validateRequest({ body: refreshTokenSchema }), asyncHandler(authController.refreshToken));
router.post("/forgot-password", validateRequest({ body: forgotPasswordSchema }), asyncHandler(authController.forgotPassword));
router.post("/reset-password", validateRequest({ body: resetPasswordSchema }), asyncHandler(authController.resetPassword));
router.post("/verify-email", validateRequest({ body: verifyEmailSchema }), asyncHandler(authController.verifyEmail));

// Protected routes
router.post(
  "/change-password",
  authMiddleware,
  validateRequest({ body: changePasswordSchema }),
  asyncHandler(authController.changePassword)
);
router.post("/resend-verification", authMiddleware, asyncHandler(authController.resendVerification));
router.get("/me", authMiddleware, asyncHandler(authController.getCurrentUser));

export default router;
