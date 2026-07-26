import { z } from "zod";

export const assignInterviewersSchema = z.object({
  interviewers: z
    .array(z.string().cuid("Invalid interviewer ID format"))
    .min(1, "At least one interviewer is required"),
});
