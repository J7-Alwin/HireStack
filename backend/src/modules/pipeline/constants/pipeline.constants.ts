import { PipelineStage } from "@prisma/client";

export const STAGE_ORDER: Record<PipelineStage, number> = {
  [PipelineStage.APPLIED]: 1,
  [PipelineStage.SCREENING]: 2,
  [PipelineStage.SHORTLISTED]: 3,
  [PipelineStage.HR_INTERVIEW]: 4,
  [PipelineStage.TECHNICAL_INTERVIEW]: 5,
  [PipelineStage.FINAL_INTERVIEW]: 6,
  [PipelineStage.OFFER_PENDING]: 7,
  [PipelineStage.OFFER_SENT]: 8,
  [PipelineStage.OFFER_ACCEPTED]: 9,
  [PipelineStage.HIRED]: 10,
  [PipelineStage.REJECTED]: 11,
  [PipelineStage.WITHDRAWN]: 12,
};

export const TERMINAL_STAGES: PipelineStage[] = [
  PipelineStage.HIRED,
  PipelineStage.REJECTED,
  PipelineStage.WITHDRAWN,
];

// Recruiter standard sequential moves
export const ALLOWED_SEQUENTIAL_TRANSITIONS: Record<PipelineStage, PipelineStage[]> = {
  [PipelineStage.APPLIED]: [
    PipelineStage.SCREENING,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.SCREENING]: [
    PipelineStage.SHORTLISTED,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.SHORTLISTED]: [
    PipelineStage.HR_INTERVIEW,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.HR_INTERVIEW]: [
    PipelineStage.TECHNICAL_INTERVIEW,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.TECHNICAL_INTERVIEW]: [
    PipelineStage.FINAL_INTERVIEW,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.FINAL_INTERVIEW]: [
    PipelineStage.OFFER_PENDING,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.OFFER_PENDING]: [
    PipelineStage.OFFER_SENT,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.OFFER_SENT]: [
    PipelineStage.OFFER_ACCEPTED,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.OFFER_ACCEPTED]: [
    PipelineStage.HIRED,
    PipelineStage.REJECTED,
    PipelineStage.WITHDRAWN,
  ],
  [PipelineStage.HIRED]: [],
  [PipelineStage.REJECTED]: [],
  [PipelineStage.WITHDRAWN]: [],
};

export const PIPELINE_MESSAGES = {
  NOT_FOUND: "Hiring pipeline not found",
  COMPLETED: "Hiring pipeline is already completed and cannot be modified",
  INVALID_TRANSITION: "Invalid pipeline stage transition",
  DUPLICATE_PIPELINE: "A pipeline already exists for this application",
  FORBIDDEN_ACCESS: "Access denied to this hiring pipeline",
  CROSS_COMPANY_ACCESS: "Cross-company access is forbidden",
  RECRUITER_OWNERSHIP: "Recruiters can only access and move their assigned candidates",
  OVERRIDE_REASON_REQUIRED:
    "A valid override reason (10-500 characters) is required for stage overrides",
};
