import { z } from "zod";
import { InterviewStatus } from "@prisma/client";

export const updateStatusSchema = z.object({
  status: z.nativeEnum(InterviewStatus, {
    message: "Invalid interview status value",
  }),
});
