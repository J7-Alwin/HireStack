import { z } from "zod";
import { InterviewType, InterviewRound, InterviewStatus, InterviewOutcome, InterviewMode } from "@prisma/client";

export const createInterviewSchema = z.object({
  applicationId: z.string().cuid("Invalid Application ID format"),
  interviewType: z.nativeEnum(InterviewType),
  round: z.nativeEnum(InterviewRound),
  mode: z.nativeEnum(InterviewMode),
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid scheduled date format"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time format"),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time format"),
  timeZone: z.string().min(1, "Time zone is required"),
  meetingLink: z.string().url("Invalid meeting link URL").max(2048).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
  interviewers: z.array(z.string().cuid()).min(1, "At least one interviewer is required"),
}).refine((data) => {
  if (data.mode === InterviewMode.ONLINE) {
    return !!data.meetingLink;
  }
  return true;
}, {
  message: "Meeting link is required for online interviews",
  path: ["meetingLink"],
}).refine((data) => {
  if (data.mode === InterviewMode.ONSITE) {
    return !!data.location;
  }
  return true;
}, {
  message: "Location is required for onsite interviews",
  path: ["location"],
});

export const updateInterviewSchema = z.object({
  mode: z.nativeEnum(InterviewMode).optional(),
  notes: z.string().max(3000).optional().nullable(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(InterviewStatus),
});

export const rescheduleSchema = z.object({
  scheduledDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid scheduled date format"),
  startTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start time format"),
  endTime: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end time format"),
  timeZone: z.string().min(1, "Time zone is required"),
  meetingLink: z.string().url("Invalid meeting link URL").max(2048).optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  notes: z.string().max(3000).optional().nullable(),
});

export const outcomeSchema = z.object({
  outcome: z.nativeEnum(InterviewOutcome),
  resultNotes: z.string().max(3000).optional().nullable(),
});

export const cancelSchema = z.object({
  cancellationReason: z.string().min(1, "Cancellation reason is required").max(1000),
});

export const assignInterviewersSchema = z.object({
  interviewers: z.array(z.string().cuid()).min(1, "At least one interviewer is required"),
});

export const queryInterviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
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
