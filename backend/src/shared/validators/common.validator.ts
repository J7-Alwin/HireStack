import { z } from "zod";
import { REGEX_PATTERNS } from "../constants/regex.constants";

export const uuidSchema = z.string().regex(REGEX_PATTERNS.UUID, "Invalid UUID format");

export const cuidSchema = z.string().regex(REGEX_PATTERNS.CUID, "Invalid CUID format");

export const phoneSchema = z.string().regex(REGEX_PATTERNS.PHONE, "Invalid phone number format");

export const booleanSchema = z.union([
  z.boolean(),
  z.enum(["true", "false"]).transform((v) => v === "true"),
]);

export const dateSchema = z.coerce.date();

export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
