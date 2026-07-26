import { z } from "zod";
import { REGEX_PATTERNS } from "../constants/regex.constants";
import { VALIDATION_LIMITS } from "../constants/validation.constants";

export const passwordValidatorSchema = z
  .string()
  .min(
    VALIDATION_LIMITS.PASSWORD_MIN,
    `Password must be at least ${VALIDATION_LIMITS.PASSWORD_MIN} characters long`
  )
  .max(
    VALIDATION_LIMITS.PASSWORD_MAX,
    `Password must not exceed ${VALIDATION_LIMITS.PASSWORD_MAX} characters`
  )
  .regex(
    REGEX_PATTERNS.STRONG_PASSWORD,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)"
  );
