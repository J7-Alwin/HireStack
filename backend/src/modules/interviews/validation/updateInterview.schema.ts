import { z } from "zod";
import { InterviewMode } from "@prisma/client";
import { normalizedString } from "./shared";

export const updateInterviewSchema = z
  .object({
    mode: z
      .nativeEnum(InterviewMode, {
        message: "Invalid interview mode",
      })
      .optional(),

    meetingLink: normalizedString(
      2048,
      "Meeting link cannot exceed 2048 characters"
    ),

    location: normalizedString(
      500,
      "Location cannot exceed 500 characters"
    ),

    notes: normalizedString(
      3000,
      "Notes cannot exceed 3000 characters"
    ),
  })
  .refine(
    (data) => {
      if (data.mode === InterviewMode.ONLINE) {
        return !!data.meetingLink;
      }
      return true;
    },
    {
      message: "ONLINE interview requires meetingLink",
      path: ["meetingLink"],
    }
  )
  .refine(
    (data) => {
      if (data.mode === InterviewMode.ONSITE) {
        return !!data.location;
      }
      return true;
    },
    {
      message: "ONSITE interview requires location",
      path: ["location"],
    }
  );