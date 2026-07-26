import { z } from "zod";
import { PipelineStage } from "@prisma/client";

export const createPipelineSchema = z.object({
  applicationId: z.string().trim().min(1, "Application ID is required"),
  notes: z.string().trim().max(2000, "Notes cannot exceed 2000 characters").optional().nullable(),
});

export const moveStageSchema = z
  .object({
    toStage: z.nativeEnum(PipelineStage, { message: "Invalid pipeline stage" }),
    reason: z.string().trim().max(500, "Reason cannot exceed 500 characters").optional(),
    comments: z.string().trim().max(2000, "Comments cannot exceed 2000 characters").optional(),
    isOverride: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.isOverride) {
        return typeof data.reason === "string" && data.reason.trim().length >= 10;
      }
      return true;
    },
    {
      message: "Override reason (10-500 characters) is required for stage overrides",
      path: ["reason"],
    }
  );

export const addNotesSchema = z.object({
  notes: z
    .string()
    .trim()
    .min(1, "Notes cannot be empty")
    .max(2000, "Notes cannot exceed 2000 characters"),
});

export const queryPipelineSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  currentStage: z.nativeEnum(PipelineStage).optional(),
  recruiterId: z.string().optional(),
  departmentId: z.string().optional(),
  jobId: z.string().optional(),
  candidateId: z.string().optional(),
  completed: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  active: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  hired: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  rejected: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  withdrawn: z.preprocess((val) => val === "true" || val === true, z.boolean()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type QueryPipelineParams = z.infer<typeof queryPipelineSchema>;
