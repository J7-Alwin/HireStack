import type { HiringRecommendationType } from './ai-common.types'

export interface JobMatchingRequest {
  readonly jobId: string
}

export interface CandidateMatchResponse {
  readonly candidateId: string
  readonly candidateName: string
  readonly matchPercentage: number
  readonly recommendation: HiringRecommendationType
}

export interface JobMatchingResponse {
  readonly jobId: string
  readonly totalCandidates: number
  readonly generatedAt: string
  readonly matches: readonly CandidateMatchResponse[]
}

export interface JobMatchDetailsResponse {
  readonly id: string
  readonly jobId: string
  readonly candidateId: string
  readonly candidateName: string
  readonly matchPercentage: number
  readonly skillMatch: number
  readonly experienceMatch: number
  readonly educationMatch: number
  readonly projectMatch: number
  readonly keywordMatch: number
  readonly strengths: readonly string[]
  readonly missingSkills: readonly string[]
  readonly overallReason: string
  readonly recommendation: HiringRecommendationType
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface JobMatchHistoryItem {
  readonly id: string
  readonly jobId: string
  readonly candidateId: string
  readonly candidateName?: string
  readonly matchPercentage: number
  readonly recommendation: HiringRecommendationType
  readonly createdAt: string
}

export type JobMatchHistoryResponse = readonly JobMatchHistoryItem[]
