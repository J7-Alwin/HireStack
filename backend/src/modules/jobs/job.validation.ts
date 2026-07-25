import { z } from "zod";
import { EmploymentType, WorkplaceType, JobStatus, Visibility } from "@prisma/client";

const numericPreprocess = (defaultValue: number) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return typeof val === "number" ? val : defaultValue;
  }, z.number().int());

const futureDateSchema = z.preprocess(
  (val) => {
    if (typeof val === "string" && val !== "") return new Date(val);
    return val;
  },
  z.date().refine((val) => val > new Date(), {
    message: "Closing date must be in the future",
  }).optional()
);

export const createJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must not exceed 150 characters"),
    description: z
      .string()
      .trim()
      .min(1, "Description is required")
      .max(10000, "Description must not exceed 10000 characters"),
    responsibilities: z
      .string()
      .trim()
      .max(10000, "Responsibilities must not exceed 10000 characters")
      .optional()
      .or(z.literal("")),
    requirements: z
      .string()
      .trim()
      .max(10000, "Requirements must not exceed 10000 characters")
      .optional()
      .or(z.literal("")),
    benefits: z
      .string()
      .trim()
      .max(5000, "Benefits must not exceed 5000 characters")
      .optional()
      .or(z.literal("")),
    departmentId: z.string().min(1, "Department ID is required"),
    employmentType: z.nativeEnum(EmploymentType, {
      message: "Invalid employment type",
    }),
    workplaceType: z.nativeEnum(WorkplaceType, {
      message: "Invalid workplace type",
    }),
    experienceMin: z.number().int().nonnegative("Minimum experience must be non-negative").optional(),
    experienceMax: z.number().int().nonnegative("Maximum experience must be non-negative").optional(),
    salaryMin: z.number().nonnegative("Minimum salary must be non-negative").optional(),
    salaryMax: z.number().nonnegative("Maximum salary must be non-negative").optional(),
    currency: z.string().trim().length(3, "Currency must be a 3-letter ISO code").toUpperCase().optional().or(z.literal("")),
    location: z.string().trim().optional().or(z.literal("")),
    openings: z.number().int().min(1, "Openings must be at least 1"),
    visibility: z.nativeEnum(Visibility).optional().default(Visibility.PUBLIC),
    closingDate: futureDateSchema,
    recruiterIds: z.array(z.string().min(1)).optional(),
    skillIds: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.experienceMin !== undefined && data.experienceMax !== undefined) {
        return data.experienceMin <= data.experienceMax;
      }
      return true;
    },
    {
      message: "Minimum experience cannot exceed maximum experience",
      path: ["experienceMax"],
    }
  )
  .refine(
    (data) => {
      if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: "Minimum salary cannot exceed maximum salary",
      path: ["salaryMax"],
    }
  );

export const updateJobSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(150, "Title must not exceed 150 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .min(1, "Description must be at least 1 character")
      .max(10000, "Description must not exceed 10000 characters")
      .optional(),
    responsibilities: z
      .string()
      .trim()
      .max(10000, "Responsibilities must not exceed 10000 characters")
      .optional()
      .or(z.literal("")),
    requirements: z
      .string()
      .trim()
      .max(10000, "Requirements must not exceed 10000 characters")
      .optional()
      .or(z.literal("")),
    benefits: z
      .string()
      .trim()
      .max(5000, "Benefits must not exceed 5000 characters")
      .optional()
      .or(z.literal("")),
    departmentId: z.string().min(1, "Department ID must be valid").optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    workplaceType: z.nativeEnum(WorkplaceType).optional(),
    experienceMin: z.number().int().nonnegative("Minimum experience must be non-negative").optional(),
    experienceMax: z.number().int().nonnegative("Maximum experience must be non-negative").optional(),
    salaryMin: z.number().nonnegative("Minimum salary must be non-negative").optional(),
    salaryMax: z.number().nonnegative("Maximum salary must be non-negative").optional(),
    currency: z.string().trim().length(3, "Currency must be a 3-letter ISO code").toUpperCase().optional().or(z.literal("")),
    location: z.string().trim().optional().or(z.literal("")),
    openings: z.number().int().min(1, "Openings must be at least 1").optional(),
    visibility: z.nativeEnum(Visibility).optional(),
    closingDate: futureDateSchema,
    recruiterIds: z.array(z.string().min(1)).optional(),
    skillIds: z.array(z.string().min(1)).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.experienceMin !== undefined && data.experienceMax !== undefined) {
        return data.experienceMin <= data.experienceMax;
      }
      return true;
    },
    {
      message: "Minimum experience cannot exceed maximum experience",
      path: ["experienceMax"],
    }
  )
  .refine(
    (data) => {
      if (data.salaryMin !== undefined && data.salaryMax !== undefined) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: "Minimum salary cannot exceed maximum salary",
      path: ["salaryMax"],
    }
  );

export const assignRecruitersSchema = z
  .object({
    recruiterIds: z.array(z.string().min(1, "Recruiter ID is required")).min(1, "At least one recruiter ID is required"),
  })
  .strict();

export const jobIdParamSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
});

export const jobIdAndRecruiterIdParamSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
  recruiterId: z.string().min(1, "Recruiter ID is required"),
});

export const listJobsQuerySchema = z
  .object({
    page: numericPreprocess(1).pipe(z.number().min(1)).default(1),
    limit: numericPreprocess(10).pipe(z.number().min(1).max(100)).default(10),
    search: z.string().optional(),
    department: z.string().optional(),
    status: z.nativeEnum(JobStatus).optional(),
    employmentType: z.nativeEnum(EmploymentType).optional(),
    workplaceType: z.nativeEnum(WorkplaceType).optional(),
    recruiter: z.string().optional(),
    createdDate: z.string().optional(),
    closingDate: z.string().optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "closingDate"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  })
  .strict();
