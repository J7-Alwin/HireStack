import { z } from "zod";

export const emailValidatorSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address format")
  .trim()
  .toLowerCase();
