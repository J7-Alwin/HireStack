import { z } from "zod";
import { InterviewType, InterviewRound, InterviewMode } from "@prisma/client";
import { normalizedString } from "./shared";

export const createInterviewSchema = z.object({
  applicationId: z.string().cuid("Invalid Application ID format"),
  interviewType: z.nativeEnum(InterviewType, {
    message: "Invalid interview type",
  }),
  round: z.nativeEnum(InterviewRound, {
    message: "Invalid interview round",
  }),
  mode: z.nativeEnum(InterviewMode, {
    message: "Invalid interview mode",
  }),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid scheduled date format"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time format"),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time format"),
  timeZone: z.string().min(1, "Time zone is required"),
  meetingLink: normalizedString(2048, "Meeting link cannot exceed 2048 characters"),
  location: normalizedString(500, "Location cannot exceed 500 characters"),
  notes: normalizedString(3000, "Notes cannot exceed 3000 characters"),
  interviewers: z.array(z.string().cuid("Invalid interviewer ID format")).min(1, "At least one interviewer is required"),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: "End time must be later than start time",
  path: ["endTime"],
}).refine((data) => {
  if (data.mode === InterviewMode.ONLINE) {
    return !!data.meetingLink;
  }
  return true;
}, {
  message: "ONLINE interview requires meetingLink",
  path: ["meetingLink"],
}).refine((data) => {
  if (data.mode === InterviewMode.ONSITE) {
    return !!data.location;
  }
  return true;
}, {
  message: "ONSITE interview requires location",
  path: ["location"],
});
