import type { AtsBaseQueryParams } from '@/utils/ats'

export type PipelineStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'HR_INTERVIEW'
  | 'TECHNICAL_INTERVIEW'
  | 'FINAL_INTERVIEW'
  | 'OFFER_PENDING'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type PipelineTimelineEventType =
  | 'APPLICATION_SUBMITTED'
  | 'SCREENING_COMPLETED'
  | 'CANDIDATE_SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEW_COMPLETED'
  | 'OFFER_PENDING'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'CANDIDATE_HIRED'
  | 'CANDIDATE_REJECTED'
  | 'CANDIDATE_WITHDRAWN'
  | 'STAGE_OVERRIDE'
  | 'NOTES_ADDED'

export interface PipelineRecruiterInfo {
  readonly id: string
  readonly name?: string | null
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly email: string
}

export interface PipelineCandidateInfo {
  readonly id: string
  readonly candidateCode: string
  readonly firstName: string
  readonly lastName: string
  readonly email?: string | null
  readonly phone?: string | null
}

export interface PipelineJobInfo {
  readonly id: string
  readonly jobCode: string
  readonly title: string
}

export interface PipelineApplicationInfo {
  readonly id: string
  readonly applicationCode: string
  readonly stage: string
  readonly status: string
  readonly assignedRecruiterId: string
}

export interface Pipeline {
  readonly id: string
  readonly companyId: string
  readonly applicationId: string
  readonly candidateId: string
  readonly recruiterId: string
  readonly jobId: string
  readonly currentStage: PipelineStage
  readonly previousStage?: PipelineStage | null
  readonly stageChangedAt: string
  readonly stageOrder: number
  readonly notes?: string | null
  readonly isCompleted: boolean
  readonly completedReason?: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt?: string | null
  readonly application?: PipelineApplicationInfo
  readonly candidate?: PipelineCandidateInfo
  readonly job?: PipelineJobInfo
  readonly recruiter?: PipelineRecruiterInfo
}

export interface PipelineHistory {
  readonly id: string
  readonly pipelineId: string
  readonly fromStage?: PipelineStage | null
  readonly toStage: PipelineStage
  readonly movedById: string
  readonly reason?: string | null
  readonly comments?: string | null
  readonly movedAt: string
  readonly movedBy?: PipelineRecruiterInfo
}

export interface PipelineTimeline {
  readonly id: string
  readonly pipelineId: string
  readonly eventType: PipelineTimelineEventType
  readonly title: string
  readonly description?: string | null
  readonly createdById: string
  readonly createdAt: string
  readonly createdBy?: PipelineRecruiterInfo
}

export interface PipelineQueryFilters extends AtsBaseQueryParams {
  readonly page?: number
  readonly limit?: number
  readonly search?: string
  readonly currentStage?: PipelineStage
  readonly recruiterId?: string
  readonly departmentId?: string
  readonly jobId?: string
  readonly candidateId?: string
  readonly completed?: boolean
  readonly active?: boolean
  readonly hired?: boolean
  readonly rejected?: boolean
  readonly withdrawn?: boolean
  readonly startDate?: string
  readonly endDate?: string
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
  readonly [key: string]: unknown
}

export interface PipelineListResponse {
  readonly data: readonly Pipeline[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}

export interface CreatePipelineInput {
  readonly applicationId: string
  readonly notes?: string | null
}

export interface MoveStageInput {
  readonly toStage: PipelineStage
  readonly reason?: string
  readonly comments?: string
  readonly isOverride?: boolean
}

export interface AddNotesInput {
  readonly notes: string
}

export interface StageColumnDefinition {
  readonly stage: PipelineStage
  readonly label: string
  readonly order: number
  readonly isTerminal?: boolean
  readonly isSuccess?: boolean
  readonly isFailure?: boolean
}
