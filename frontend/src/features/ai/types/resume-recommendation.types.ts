export type ResumeRecommendationCategory =
  | 'SUMMARY'
  | 'EXPERIENCE'
  | 'SKILLS'
  | 'EDUCATION'
  | 'PROJECTS'
  | 'CERTIFICATIONS'
  | 'KEYWORDS'
  | 'ATS_OPTIMIZATION'
  | 'FORMATTING_AND_STRUCTURE'

export type ResumeRecommendationPriority = 'HIGH' | 'MEDIUM' | 'LOW'

export type ResumeRecommendationMode = 'GENERAL' | 'JOB_SPECIFIC'

export interface ResumeRecommendationItem {
  readonly category: ResumeRecommendationCategory
  readonly priority: ResumeRecommendationPriority
  readonly currentIssue: string
  readonly recommendation: string
  readonly reason: string
  readonly evidence: string
  readonly expectedImprovement: string
  readonly jobRequirement?: string
}

export interface GeneralResumeRecommendationRequest {
  readonly candidateId: string
}

export interface JobSpecificResumeRecommendationRequest {
  readonly candidateId: string
  readonly jobId: string
}

export interface ResumeRecommendationResponse {
  readonly id: string
  readonly candidateId: string
  readonly jobId?: string | null
  readonly mode: ResumeRecommendationMode
  readonly overallSummary: string
  readonly recommendations: readonly ResumeRecommendationItem[]
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface ResumeRecommendationHistoryItem {
  readonly id: string
  readonly candidateId: string
  readonly jobId?: string | null
  readonly jobTitle?: string | null
  readonly mode: ResumeRecommendationMode
  readonly overallSummary: string
  readonly totalRecommendations?: number
  readonly createdAt: string
  readonly updatedAt?: string
}

export type ResumeRecommendationHistoryResponse = readonly ResumeRecommendationHistoryItem[]
