import { z } from "zod";
import { normalizedString } from "./shared";

export const rescheduleSchema = z
  .object({
    scheduledDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), "Invalid scheduled date format"),
    startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time format"),
    endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time format"),
    timeZone: z.string().min(1, "Time zone is required"),
    meetingLink: normalizedString(2048, "Meeting link cannot exceed 2048 characters"),
    location: normalizedString(500, "Location cannot exceed 500 characters"),
    notes: normalizedString(3000, "Notes cannot exceed 3000 characters"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    },
    {
      message: "End time must be later than start time",
      path: ["endTime"],
    }
  );
