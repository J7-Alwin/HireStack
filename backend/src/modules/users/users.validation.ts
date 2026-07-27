import { z } from "zod";
import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";

// Helper to preprocess numeric query params
const numericPreprocess = (defaultValue: number) =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    return typeof val === "number" ? val : defaultValue;
  }, z.number().int());

// Helper to preprocess boolean query params
const booleanPreprocess = () =>
  z.preprocess((val) => {
    if (typeof val === "string") {
      return val.toLowerCase() === "true";
    }
    return !!val;
  }, z.boolean().default(false));

export const listUsersQuerySchema = z.object({
  page: numericPreprocess(1).pipe(z.number().min(1)).default(1),
  limit: numericPreprocess(10).pipe(z.number().min(1).max(100)).default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  companyId: z.string().optional(),
  search: z.string().optional(),
  showDeleted: booleanPreprocess(),
});

export const userIdParamSchema = z.object({
  id: z.cuid({
    message: "Invalid user ID",
  }),
});

export const updateStatusBodySchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], {
    message: "Status must be ACTIVE, INACTIVE, or SUSPENDED",
  }),
});
