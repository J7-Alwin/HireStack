import { PipelineStage, PipelineTimelineEventType } from "@prisma/client";

export interface RecruiterDto {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export interface CandidateDto {
  id: string;
  candidateCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

export interface JobDto {
  id: string;
  jobCode: string;
  title: string;
}

export interface ApplicationDto {
  id: string;
  applicationCode: string;
  stage: string;
  status: string;
  assignedRecruiterId: string;
}

export interface PipelineDto {
  id: string;
  companyId: string;
  applicationId: string;
  candidateId: string;
  recruiterId: string;
  jobId: string;
  currentStage: PipelineStage;
  previousStage: PipelineStage | null;
  stageChangedAt: string;
  stageOrder: number;
  notes: string | null;
  isCompleted: boolean;
  completedReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  application?: ApplicationDto;
  candidate?: CandidateDto;
  job?: JobDto;
  recruiter?: RecruiterDto;
}

export interface PipelineHistoryDto {
  id: string;
  pipelineId: string;
  fromStage: PipelineStage | null;
  toStage: PipelineStage;
  movedById: string;
  reason: string | null;
  comments: string | null;
  movedAt: string;
  movedBy?: RecruiterDto;
}

export interface PipelineTimelineDto {
  id: string;
  pipelineId: string;
  eventType: PipelineTimelineEventType;
  title: string;
  description: string;
  createdById: string;
  createdAt: string;
  createdBy?: RecruiterDto;
}

// Mapper functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPipelineDto(raw: any): PipelineDto {
  if (!raw) return raw;
  return {
    id: raw.id,
    companyId: raw.companyId,
    applicationId: raw.applicationId,
    candidateId: raw.candidateId,
    recruiterId: raw.recruiterId,
    jobId: raw.jobId,
    currentStage: raw.currentStage,
    previousStage: raw.previousStage,
    stageChangedAt:
      raw.stageChangedAt instanceof Date ? raw.stageChangedAt.toISOString() : raw.stageChangedAt,
    stageOrder: raw.stageOrder,
    notes: raw.notes,
    isCompleted: raw.isCompleted,
    completedReason: raw.completedReason,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    updatedAt: raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : raw.updatedAt,
    deletedAt: raw.deletedAt instanceof Date ? raw.deletedAt.toISOString() : raw.deletedAt || null,
    application: raw.application
      ? {
          id: raw.application.id,
          applicationCode: raw.application.applicationCode,
          stage: raw.application.stage,
          status: raw.application.status,
          assignedRecruiterId: raw.application.assignedRecruiterId,
        }
      : undefined,
    candidate: raw.candidate
      ? {
          id: raw.candidate.id,
          candidateCode: raw.candidate.candidateCode,
          firstName: raw.candidate.firstName,
          lastName: raw.candidate.lastName,
          email: raw.candidate.email,
          phone: raw.candidate.phone,
        }
      : undefined,
    job: raw.job
      ? {
          id: raw.job.id,
          jobCode: raw.job.jobCode,
          title: raw.job.title,
        }
      : undefined,
    recruiter: raw.recruiter
      ? {
          id: raw.recruiter.id,
          name: raw.recruiter.name,
          firstName: raw.recruiter.firstName,
          lastName: raw.recruiter.lastName,
          email: raw.recruiter.email,
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPipelineHistoryDto(raw: any): PipelineHistoryDto {
  if (!raw) return raw;
  return {
    id: raw.id,
    pipelineId: raw.pipelineId,
    fromStage: raw.fromStage,
    toStage: raw.toStage,
    movedById: raw.movedById,
    reason: raw.reason,
    comments: raw.comments,
    movedAt: raw.movedAt instanceof Date ? raw.movedAt.toISOString() : raw.movedAt,
    movedBy: raw.movedBy
      ? {
          id: raw.movedBy.id,
          name: raw.movedBy.name,
          firstName: raw.movedBy.firstName,
          lastName: raw.movedBy.lastName,
          email: raw.movedBy.email,
        }
      : undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPipelineTimelineDto(raw: any): PipelineTimelineDto {
  if (!raw) return raw;
  return {
    id: raw.id,
    pipelineId: raw.pipelineId,
    eventType: raw.eventType,
    title: raw.title,
    description: raw.description,
    createdById: raw.createdById,
    createdAt: raw.createdAt instanceof Date ? raw.createdAt.toISOString() : raw.createdAt,
    createdBy: raw.createdBy
      ? {
          id: raw.createdBy.id,
          name: raw.createdBy.name,
          firstName: raw.createdBy.firstName,
          lastName: raw.createdBy.lastName,
          email: raw.createdBy.email,
        }
      : undefined,
  };
}
