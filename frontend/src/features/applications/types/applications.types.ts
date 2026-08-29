import type { AtsBaseQueryParams } from '@/utils/ats'
import type { CandidateSource } from '@/features/candidates/types/candidates.types'

export type ApplicationStage =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'OFFER'

export type ApplicationStatus =
  | 'ACTIVE'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'ARCHIVED'

export type { CandidateSource }

export interface ApplicationCandidateSummary {
  readonly id: string
  readonly candidateCode: string
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly phone?: string | null
  readonly status: string
  readonly deletedAt?: string | null
}

export interface ApplicationJobSummary {
  readonly id: string
  readonly jobCode: string
  readonly title: string
  readonly status: string
  readonly deletedAt?: string | null
}

export interface ApplicationRecruiterSummary {
  readonly id: string
  readonly name?: string | null
  readonly email: string
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly designation?: string | null
  readonly avatar?: string | null
  readonly companyId: string
  readonly role: string
}

export interface Application {
  readonly id: string
  readonly applicationCode: string
  readonly companyId: string
  readonly candidateId: string
  readonly candidate?: ApplicationCandidateSummary
  readonly jobId: string
  readonly job?: ApplicationJobSummary
  readonly assignedRecruiterId: string
  readonly assignedRecruiter?: ApplicationRecruiterSummary
  readonly stage: ApplicationStage
  readonly status: ApplicationStatus
  readonly source?: CandidateSource | null
  readonly remarks?: string | null
  readonly rejectionReasonCode?: string | null
  readonly rejectionReasonNote?: string | null
  readonly withdrawalReasonCode?: string | null
  readonly withdrawalReasonNote?: string | null
  readonly appliedAt: string
  readonly createdBy: string
  readonly creator?: {
    readonly id: string
    readonly name?: string | null
    readonly email: string
  }
  readonly updatedBy?: string | null
  readonly updater?: {
    readonly id: string
    readonly name?: string | null
    readonly email: string
  }
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt?: string | null
}

export interface ApplicationFilterParams extends AtsBaseQueryParams {
  readonly stage?: ApplicationStage
  readonly status?: ApplicationStatus
  readonly recruiter?: string
  readonly candidate?: string
  readonly job?: string
  readonly source?: CandidateSource
  readonly appliedDate?: string
  readonly createdDate?: string
}

export interface CreateApplicationInput {
  readonly candidateId: string
  readonly jobId: string
  readonly assignedRecruiterId: string
  readonly source?: CandidateSource | null
  readonly remarks?: string | null
}

export interface UpdateApplicationInput {
  readonly remarks?: string | null
}

export interface AssignRecruiterInput {
  readonly assignedRecruiterId: string
}

export interface UpdateStageInput {
  readonly stage: ApplicationStage
}

export interface UpdateStatusInput {
  readonly status: ApplicationStatus
}

export interface RejectApplicationInput {
  readonly rejectionReasonCode: string
  readonly rejectionReasonNote?: string | null
}

export interface WithdrawApplicationInput {
  readonly withdrawalReasonCode: string
  readonly withdrawalReasonNote?: string | null
}
