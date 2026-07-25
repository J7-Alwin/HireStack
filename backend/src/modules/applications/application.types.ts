import { ApplicationStage, ApplicationStatus, CandidateSource } from "@prisma/client";

export interface ApplicationQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  stage?: ApplicationStage;
  status?: ApplicationStatus;
  recruiter?: string; // recruiter ID
  candidate?: string; // candidate ID
  job?: string;       // job ID
  source?: CandidateSource;
  appliedDate?: string;
  createdDate?: string;
  sortBy?: "appliedAt" | "createdAt" | "updatedAt" | "candidateName" | "jobTitle" | "stage" | "status";
  sortOrder?: "asc" | "desc";
}

export interface ApplicationCreateInput {
  candidateId: string;
  jobId: string;
  assignedRecruiterId: string;
  source?: CandidateSource | null;
  remarks?: string | null;
}

export interface ApplicationUpdateInput {
  remarks?: string | null;
}

export interface ApplicationAssignRecruiterInput {
  assignedRecruiterId: string;
}

export interface ApplicationUpdateStageInput {
  stage: ApplicationStage;
}

export interface ApplicationUpdateStatusInput {
  status: ApplicationStatus;
}

export interface ApplicationRejectInput {
  rejectionReasonCode: string;
  rejectionReasonNote?: string | null;
}

export interface ApplicationWithdrawInput {
  withdrawalReasonCode: string;
  withdrawalReasonNote?: string | null;
}
