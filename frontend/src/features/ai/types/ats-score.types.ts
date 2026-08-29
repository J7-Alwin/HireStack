import type { HiringRecommendationType } from './ai-common.types'

export interface ATSScoreRequest {
  readonly candidateId: string
  readonly jobId: string
}

export interface ATSScoreResponse {
  readonly overallScore: number
  readonly skillScore: number
  readonly experienceScore: number
  readonly educationScore: number
  readonly keywordScore: number
  readonly certificationScore: number
  readonly strengths: readonly string[]
  readonly weaknesses: readonly string[]
  readonly missingSkills: readonly string[]
  readonly recommendations: readonly string[]
  readonly hiringRecommendation: HiringRecommendationType
  readonly overallReason: string
  readonly aiModel?: string
  readonly promptVersion?: string
}
