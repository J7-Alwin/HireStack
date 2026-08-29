import type { AtsBaseQueryParams } from '@/utils/ats'

export type InterviewStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type InterviewType =
  | 'INTERNAL'
  | 'CLIENT'
  | 'CAMPUS'
  | 'WALK_IN'
  | 'OTHER'

export type InterviewRound =
  | 'SCREENING'
  | 'TECHNICAL'
  | 'MANAGERIAL'
  | 'HR'
  | 'FINAL'

export type InterviewMode =
  | 'ONLINE'
  | 'ONSITE'
  | 'PHONE'

export type InterviewOutcome =
  | 'PASS'
  | 'FAIL'
  | 'ON_HOLD'
  | 'RECOMMENDED'
  | 'STRONG_RECOMMEND'
  | 'NOT_RECOMMENDED'

export interface InterviewCandidateInfo {
  readonly id: string
  readonly candidateCode?: string
  readonly firstName: string
  readonly lastName: string
  readonly email: string
  readonly phone?: string | null
}
export type InterviewCandidate = InterviewCandidateInfo

export interface InterviewJobInfo {
  readonly id: string
  readonly jobCode?: string
  readonly title: string
}
export type InterviewJob = InterviewJobInfo

export interface InterviewAssignedRecruiter {
  readonly id: string
  readonly name?: string | null
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly email: string
}

export interface InterviewApplicationInfo {
  readonly id: string
  readonly applicationCode: string
  readonly stage: string
  readonly status: string
  readonly assignedRecruiterId?: string | null
  readonly assignedRecruiter?: InterviewAssignedRecruiter | null
  readonly candidate: InterviewCandidateInfo
  readonly job: InterviewJobInfo
}
export type InterviewApplication = InterviewApplicationInfo

export interface InterviewerUser {
  readonly id: string
  readonly name?: string | null
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly email?: string | null
  readonly designation?: string | null
}

export interface InterviewInterviewer {
  readonly id: string
  readonly interviewerId: string
  readonly interviewer: InterviewerUser
}

export interface Interview {
  readonly id: string
  readonly interviewCode: string
  readonly companyId: string
  readonly applicationId: string
  readonly interviewType: InterviewType
  readonly round: InterviewRound
  readonly status: InterviewStatus
  readonly outcome?: InterviewOutcome | null
  readonly mode: InterviewMode
  readonly scheduledDate: string
  readonly startTime: string
  readonly endTime: string
  readonly timeZone: string
  readonly meetingLink?: string | null
  readonly location?: string | null
  readonly notes?: string | null
  readonly resultNotes?: string | null
  readonly cancellationReason?: string | null
  readonly cancelledAt?: string | null
  readonly cancelledById?: string | null
  readonly completedAt?: string | null
  readonly createdBy: string
  readonly updatedBy?: string | null
  readonly createdAt: string
  readonly updatedAt: string
  readonly deletedAt?: string | null
  readonly application: InterviewApplication
  readonly interviewers: readonly InterviewInterviewer[]
}

export interface InterviewFilterParams extends AtsBaseQueryParams {
  readonly interviewType?: InterviewType
  readonly round?: InterviewRound
  readonly status?: InterviewStatus
  readonly outcome?: InterviewOutcome
  readonly mode?: InterviewMode
  readonly recruiterId?: string
  readonly interviewerId?: string
  readonly scheduledDate?: string
  readonly createdAt?: string
}

export interface CreateInterviewInput {
  readonly applicationId: string
  readonly interviewType: InterviewType
  readonly round: InterviewRound
  readonly mode: InterviewMode
  readonly scheduledDate: string
  readonly startTime: string
  readonly endTime: string
  readonly timeZone: string
  readonly meetingLink?: string
  readonly location?: string
  readonly notes?: string
  readonly interviewers: readonly string[]
}

export interface UpdateInterviewInput {
  readonly mode?: InterviewMode
  readonly meetingLink?: string
  readonly location?: string
  readonly notes?: string
}

export interface UpdateInterviewStatusInput {
  readonly status: InterviewStatus
}

export interface RescheduleInterviewInput {
  readonly scheduledDate: string
  readonly startTime: string
  readonly endTime: string
  readonly timeZone: string
  readonly meetingLink?: string
  readonly location?: string
  readonly notes?: string
}

export interface RecordInterviewOutcomeInput {
  readonly outcome: InterviewOutcome
  readonly resultNotes?: string
}

export interface CancelInterviewInput {
  readonly cancellationReason: string
}

export interface AssignInterviewersInput {
  readonly interviewers: readonly string[]
}

export interface InterviewListResponse {
  readonly data: readonly Interview[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}
