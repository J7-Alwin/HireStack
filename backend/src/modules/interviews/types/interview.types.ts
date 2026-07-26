import {
  InterviewType,
  InterviewRound,
  InterviewStatus,
  InterviewOutcome,
  InterviewMode,
} from "@prisma/client";

export interface CreateInterviewInput {
  applicationId: string;
  interviewType: InterviewType;
  round: InterviewRound;
  mode: InterviewMode;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
  interviewers: string[];
}

export interface UpdateInterviewInput {
  mode?: InterviewMode;
  notes?: string | null;
}

export interface UpdateStatusInput {
  status: InterviewStatus;
}

export interface RescheduleInterviewInput {
  scheduledDate: string;
  startTime: string;
  endTime: string;
  timeZone: string;
  meetingLink?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface CancelInterviewInput {
  cancellationReason: string;
}

export interface OutcomeInput {
  outcome: InterviewOutcome;
  resultNotes?: string | null;
}

export interface AssignInterviewersInput {
  interviewers: string[];
}

export interface InterviewQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  interviewType?: InterviewType;
  round?: InterviewRound;
  status?: InterviewStatus;
  outcome?: InterviewOutcome;
  mode?: InterviewMode;
  recruiterId?: string;
  interviewerId?: string;
  scheduledDate?: string;
  createdAt?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
