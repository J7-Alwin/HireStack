import { z } from "zod";
import { InterviewOutcome } from "@prisma/client";
import { normalizedString } from "./shared";

export const outcomeSchema = z.object({
  outcome: z.nativeEnum(InterviewOutcome, {
    message: "Invalid interview outcome value",
  }),
  resultNotes: normalizedString(3000, "Result Notes cannot exceed 3000 characters"),
});
