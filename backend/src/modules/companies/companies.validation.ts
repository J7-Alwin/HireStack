import { z } from "zod";
import { emailValidatorSchema } from "../../shared/validators/email.validator";
import { AccountStatus } from "../../shared/enums/status.enum";

// Preprocessing helpers for queries
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

export const onboardingSchema = z.object({
  company: z.object({
    name: z.string().trim().min(1, "Company name is required").max(150, "Company name must not exceed 150 characters"),
    description: z.string().trim().max(5000, "Description must not exceed 5000 characters").optional(),
    website: optionalUrlSchema,
    industry: z.string().trim().min(1, "Industry is required"),
    companySize: z.string().trim().min(1, "Company size is required"),
    email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Invalid email address format").optional()),
    phone: z.string().trim().min(5, "Phone number must be at least 5 characters").optional().or(z.literal("")),
    headquarters: z.string().trim().optional(),
    foundedYear: z.preprocess(
      (val) => (typeof val === "string" ? parseInt(val, 10) : val),
      z.number().int().min(1700).max(2100).optional()
    ),
    linkedin: optionalUrlSchema,
    twitter: optionalUrlSchema,
    facebook: optionalUrlSchema,
    instagram: optionalUrlSchema,
    logoUrl: optionalUrlSchema,
    coverImage: optionalUrlSchema,
  }),
  admin: z.object({
    email: emailValidatorSchema,
    name: z.string().trim().min(1, "Admin name is required").optional(),
  }),
});

export const updateCompanySchema = z.object({
  name: z.string().trim().min(1, "Company name is required").max(150, "Company name must not exceed 150 characters").optional(),
  description: z.string().trim().max(5000, "Description must not exceed 5000 characters").optional(),
  website: optionalUrlSchema,
  industry: z.string().trim().min(1, "Industry is required").optional(),
  companySize: z.string().trim().min(1, "Company size is required").optional(),
  email: z.preprocess((val) => (val === "" ? undefined : val), z.string().email("Invalid email address format").optional()),
  phone: z.string().trim().min(5, "Phone number must be at least 5 characters").optional().or(z.literal("")),
  headquarters: z.string().trim().optional(),
  foundedYear: z.preprocess(
    (val) => (typeof val === "string" ? parseInt(val, 10) : val),
    z.number().int().min(1700).max(2100).optional()
  ),
  linkedin: optionalUrlSchema,
  twitter: optionalUrlSchema,
  facebook: optionalUrlSchema,
  instagram: optionalUrlSchema,
  logoUrl: optionalUrlSchema,
  coverImage: optionalUrlSchema,
});

export const listCompaniesQuerySchema = z.object({
  page: numericPreprocess(1).pipe(z.number().min(1)).default(1),
  limit: numericPreprocess(10).pipe(z.number().min(1).max(100)).default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  industry: z.string().optional(),
  companySize: z.string().optional(),
  isVerified: booleanPreprocess().optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  search: z.string().optional(),
  showDeleted: booleanPreprocess(),
});

export const companyIdParamSchema = z.object({
  id: z.string().min(1, "Company ID is required"),
});

export const updateCompanyStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    message: "Status must be ACTIVE, INACTIVE, or SUSPENDED",
  }),
});
