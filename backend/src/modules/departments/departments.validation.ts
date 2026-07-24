import { z } from "zod";

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

export const createDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const updateDepartmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(100, "Department name must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export const listDepartmentsQuerySchema = z.object({
  page: numericPreprocess(1).pipe(z.number().min(1)).default(1),
  limit: numericPreprocess(10).pipe(z.number().min(1).max(100)).default(10),
  sortBy: z.enum(["name", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  showDeleted: booleanPreprocess(),
  companyId: z.string().optional(),
});

export const changeStatusSchema = z.object({
  isActive: z.boolean({
    message: "isActive must be a boolean",
  }),
});

export const departmentIdParamSchema = z.object({
  id: z.string().min(1, "Department ID is required"),
});
