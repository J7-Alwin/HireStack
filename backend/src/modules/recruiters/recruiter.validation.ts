import { z } from "zod";
import { emailValidatorSchema } from "../../shared/validators/email.validator";

const numericPreprocess = (defaultValue: number) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return typeof val === "number" ? val : defaultValue;
  }, z.number().int());

const booleanPreprocess = () =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      return val.toLowerCase() === "true";
    }
    return !!val;
  }, z.boolean().default(false));

const optionalUrlSchema = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().url("Invalid URL format").optional()
);

export const createRecruiterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(100, "First name must not exceed 100 characters"),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(100, "Last name must not exceed 100 characters"),
    email: emailValidatorSchema,
    departmentId: z.string().min(1, "Department ID is required"),
    designation: z
      .string()
      .trim()
      .min(1, "Designation is required")
      .max(100, "Designation must not exceed 100 characters"),
    phone: z
      .string()
      .trim()
      .min(5, "Phone number must be at least 5 characters")
      .optional()
      .or(z.literal("")),
    experience: z.preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().int().nonnegative("Experience must be a positive number").optional()
    ),
    avatar: optionalUrlSchema,
  })
  .strict();

export const updateRecruiterSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name must be at least 1 character")
      .max(100, "First name must not exceed 100 characters")
      .optional(),
    lastName: z
      .string()
      .trim()
      .min(1, "Last name must be at least 1 character")
      .max(100, "Last name must not exceed 100 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .min(5, "Phone number must be at least 5 characters")
      .optional()
      .or(z.literal("")),
    designation: z
      .string()
      .trim()
      .min(1, "Designation must be at least 1 character")
      .max(100, "Designation must not exceed 100 characters")
      .optional(),
    experience: z.preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().int().nonnegative("Experience must be a positive number").optional()
    ),
    avatar: optionalUrlSchema,
    departmentId: z.string().min(1, "Department ID is required").optional(),
  })
  .strict();

export const changeDepartmentSchema = z
  .object({
    departmentId: z.string().min(1, "Department ID is required"),
  })
  .strict();

export const listRecruitersQuerySchema = z
  .object({
    page: numericPreprocess(1).pipe(z.number().min(1)).default(1),
    limit: numericPreprocess(10).pipe(z.number().min(1).max(100)).default(10),
    sortBy: z
      .enum(["name", "createdAt", "updatedAt", "department"])
      .optional()
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
    search: z.string().optional(),
    department: z.string().optional(),
    designation: z.string().optional(),
    isActive: z.preprocess((val) => {
      if (typeof val === "string") {
        if (val.toLowerCase() === "true") return true;
        if (val.toLowerCase() === "false") return false;
      }
      return val;
    }, z.boolean().optional()),
    showDeleted: booleanPreprocess(),
  })
  .strict();

export const recruiterIdParamSchema = z.object({
  id: z.string().min(1, "Recruiter ID is required"),
});
