import { env } from "../../config";

export const AUTH_MESSAGES = {
  INVALID_CREDENTIALS: "Invalid email or password",
  ACCOUNT_SUSPENDED: "Your account has been suspended",
  ACCOUNT_INACTIVE: "Your account is inactive",
  EMAIL_UNVERIFIED: "Please verify your email before logging in",
  PASSWORD_CHANGED: "Password changed successfully. Please log in again.",
  PASSWORD_RESET_REQUESTED: "If the email exists, a password reset link has been sent.",
  PASSWORD_RESET_COMPLETED: "Password reset completed successfully. Please log in again.",
  EMAIL_VERIFIED: "Email verified successfully.",
  RESEND_VERIFICATION_SUCCESS: "Verification email resent successfully.",
  LOGOUT_SUCCESS: "Logged out successfully.",
  SESSION_EXPIRED: "Session expired or invalid.",
};

export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 100,
};

export const getSessionExpiryDate = (expiresIn: string = env.JWT_REFRESH_EXPIRES_IN): Date => {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const msMap: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return new Date(Date.now() + value * (msMap[unit] || 24 * 60 * 60 * 1000));
};
