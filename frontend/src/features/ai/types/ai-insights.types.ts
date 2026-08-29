export interface GenerateAiInsightsRequest {
  readonly candidateId: string
  readonly jobId: string
}

export interface AiInsightResponse {
  readonly id: string
  readonly candidateId: string
  readonly jobId: string | null
  readonly overallInsight: string
  readonly strengths: readonly string[]
  readonly weaknesses: readonly string[]
  readonly skillGaps: readonly string[]
  readonly experienceConcerns: readonly string[]
  readonly hiringRisks: readonly string[]
  readonly hiringConfidence: number
  readonly jobFitObservations: readonly string[]
  readonly recruiterFocusAreas: readonly string[]
  readonly recommendation: string
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface AiInsightHistoryItem {
  readonly id: string
  readonly candidateId: string
  readonly jobId: string | null
  readonly overallInsight: string
  readonly hiringConfidence: number
  readonly recommendation: string
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export type AiInsightHistoryResponse = readonly AiInsightHistoryItem[]
