import { InterviewStatus } from "@prisma/client";

export const INTERVIEW_MESSAGES = {
  INTERVIEW_NOT_FOUND: "Interview not found",
  INTERVIEW_CREATED: "Interview scheduled successfully",
  INTERVIEW_RETRIEVED: "Interview details retrieved successfully",
  INTERVIEWS_RETRIEVED: "Interviews retrieved successfully",
  INTERVIEW_UPDATED: "Interview updated successfully",
  INTERVIEW_STATUS_UPDATED: "Interview status updated successfully",
  INTERVIEW_RESCHEDULED: "Interview rescheduled successfully",
  INTERVIEW_CANCELLED: "Interview cancelled successfully",
  INTERVIEW_OUTCOME_RECORDED: "Interview outcome and result notes recorded successfully",
  INTERVIEWERS_UPDATED: "Interviewers assigned successfully",
  INTERVIEW_DELETED: "Interview soft-deleted successfully",
  APPLICATION_NOT_ELIGIBLE: "Application is not eligible for scheduling interviews. It must be ACTIVE",
  INTERVIEWER_CONFLICT: "Interviewer scheduling conflict detected. One or more interviewers are already booked at this time",
  DUPLICATE_ROUND: "An active interview of the same round is already scheduled for this application",
  INVALID_STATUS_TRANSITION: "Invalid interview status transition",
  OUTCOME_NOT_ALLOWED: "Outcome can only be recorded when interview status is COMPLETED",
  FORBIDDEN_ACCESS: "You do not have permission to perform this action",
  CROSS_COMPANY_ACCESS_FORBIDDEN: "Cross-company access is not permitted",
  FORBIDDEN_MODIFICATION: "You do not have permission to modify this interview",
  CANNOT_DELETE_DELETED: "Interview is already soft-deleted",
  IMMUTABLE_FIELD_UPDATE: "Immutable fields cannot be modified",
  CANCELLATION_REASON_REQUIRED: "Cancellation reason is required",
  OUTCOME_REQUIRED: "Outcome is required",
  TIME_VALIDATION_ERROR: "Start time must be before end time and scheduled date cannot be in the past",
};

export const STATUS_TRANSITION_RULES: Record<InterviewStatus, InterviewStatus[]> = {
  [InterviewStatus.SCHEDULED]: [InterviewStatus.CONFIRMED, InterviewStatus.CANCELLED],
  [InterviewStatus.CONFIRMED]: [InterviewStatus.IN_PROGRESS, InterviewStatus.CANCELLED, InterviewStatus.NO_SHOW],
  [InterviewStatus.IN_PROGRESS]: [InterviewStatus.COMPLETED],
  [InterviewStatus.COMPLETED]: [],
  [InterviewStatus.CANCELLED]: [],
  [InterviewStatus.NO_SHOW]: [],
};
