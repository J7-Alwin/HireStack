import { z } from "zod";
import { emailValidatorSchema } from "../../shared/validators/email.validator";
import { passwordValidatorSchema } from "../../shared/validators/password.validator";

export const loginSchema = z.object({
  email: emailValidatorSchema,
  password: z.string().min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordValidatorSchema,
    confirmPassword: z.string().min(1, "Confirmation password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password must match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailValidatorSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordValidatorSchema,
    confirmPassword: z.string().min(1, "Confirmation password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation password must match",
    path: ["confirmPassword"],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
