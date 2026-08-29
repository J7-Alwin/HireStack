import type { Role, AccountStatus } from '@/types'

/**
 * Backend Hiring Pipeline Stage Breakdown & Summary Metrics
 * Matches backend `aggregateDashboardMetrics` response schema from `/pipeline/dashboard/*`
 */
export interface PipelineDashboardMetrics {
  readonly activeCandidates: number
  readonly hiredCount: number
  readonly rejectedCount: number
  readonly withdrawnCount: number
  readonly interviewsToday: number
  readonly offersPending: number
  readonly offersAccepted: number
  readonly stageBreakdown: Record<string, number>
}

/**
 * Super Admin Company Summary Item
 * Matches `GET /companies` item schema
 */
export interface CompanySummaryItem {
  readonly id: string
  readonly name: string
  readonly domain?: string
  readonly industry?: string
  readonly companySize?: string
  readonly status: AccountStatus | string
  readonly isVerified: boolean
  readonly subscriptionPlan?: string
  readonly createdAt: string
}

/**
 * Super Admin User Summary Item
 * Matches `GET /users` item schema
 */
export interface UserSummaryItem {
  readonly id: string
  readonly email: string
  readonly name?: string
  readonly role: Role
  readonly status: AccountStatus
  readonly companyId?: string | null
  readonly createdAt: string
}

/**
 * Company Job Summary Item
 * Matches `GET /jobs` item schema
 */
export interface JobSummaryItem {
  readonly id: string
  readonly title: string
  readonly department?: string | { id: string; name: string }
  readonly status: string
  readonly workplaceType?: string
  readonly employmentType?: string
  readonly createdAt: string
}

/**
 * Company Application Summary Item
 * Matches `GET /applications` item schema
 */
export interface ApplicationSummaryItem {
  readonly id: string
  readonly applicationCode: string
  readonly candidateId: string
  readonly jobId: string
  readonly stage: string
  readonly status: string
  readonly appliedAt?: string
  readonly createdAt: string
  readonly candidate?: {
    readonly id: string
    readonly firstName: string
    readonly lastName: string
    readonly email: string
  }
  readonly job?: {
    readonly id: string
    readonly title: string
  }
}

/**
 * Company Interview Summary Item
 * Matches `GET /interviews` item schema
 */
export interface InterviewSummaryItem {
  readonly id: string
  readonly interviewType: string
  readonly round: string
  readonly status: string
  readonly scheduledDate: string
  readonly mode?: string
  readonly meetingLink?: string
  readonly location?: string
}

/**
 * Aggregated Super Admin Dashboard Model
 */
export interface SuperAdminDashboardData {
  readonly totalCompanies: number
  readonly activeCompanies: number
  readonly totalUsers: number
  readonly activeUsers: number
  readonly recentCompanies: readonly CompanySummaryItem[]
  readonly recentUsers: readonly UserSummaryItem[]
}

/**
 * Aggregated Company Admin Dashboard Model
 */
export interface CompanyAdminDashboardData {
  readonly pipelineMetrics: PipelineDashboardMetrics
  readonly recentJobs: readonly JobSummaryItem[]
  readonly recentApplications: readonly ApplicationSummaryItem[]
  readonly upcomingInterviews: readonly InterviewSummaryItem[]
}

/**
 * Aggregated Recruiter Dashboard Model
 */
export interface RecruiterDashboardData {
  readonly pipelineMetrics: PipelineDashboardMetrics
  readonly assignedApplications: readonly ApplicationSummaryItem[]
  readonly upcomingInterviews: readonly InterviewSummaryItem[]
}
