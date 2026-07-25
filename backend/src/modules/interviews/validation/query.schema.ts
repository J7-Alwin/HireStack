import { z } from "zod";
import { InterviewType, InterviewRound, InterviewStatus, InterviewOutcome, InterviewMode } from "@prisma/client";
import { PAGINATION_DEFAULTS } from "../../../shared/constants/pagination.constants";

export const queryInterviewsSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").optional().default(PAGINATION_DEFAULTS.PAGE),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(PAGINATION_DEFAULTS.MAX_LIMIT, `Limit cannot exceed ${PAGINATION_DEFAULTS.MAX_LIMIT}`).optional().default(PAGINATION_DEFAULTS.LIMIT),
  search: z.string().trim().max(100, "Search query cannot exceed 100 characters").optional(),
  interviewType: z.nativeEnum(InterviewType).optional(),
  round: z.nativeEnum(InterviewRound).optional(),
  status: z.nativeEnum(InterviewStatus).optional(),
  outcome: z.nativeEnum(InterviewOutcome).optional(),
  mode: z.nativeEnum(InterviewMode).optional(),
  recruiterId: z.string().optional(),
  interviewerId: z.string().optional(),
  scheduledDate: z.string().optional(),
  createdAt: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
