import { z } from "zod";
import { InterviewMode } from "@prisma/client";
import { normalizedString } from "./shared";

export const updateInterviewSchema = z.object({
  mode: z
    .nativeEnum(InterviewMode, {
      message: "Invalid interview mode",
    })
    .optional(),
  notes: normalizedString(3000, "Notes cannot exceed 3000 characters"),
});
