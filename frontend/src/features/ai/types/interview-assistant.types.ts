export type InterviewAssistantMode = 'GENERAL' | 'JOB_SPECIFIC'

export type InterviewQuestionCategory =
  | 'TECHNICAL'
  | 'HR'
  | 'BEHAVIORAL'
  | 'PROJECT'
  | 'ROLE_SPECIFIC'
  | 'FOLLOW_UP'

export type InterviewDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

export interface InterviewQuestion {
  readonly category: InterviewQuestionCategory
  readonly question: string
  readonly reason: string
  readonly difficulty: InterviewDifficulty
  readonly followUps: readonly string[]
}

export interface GeneralInterviewRequest {
  readonly candidateId: string
}

export interface JobSpecificInterviewRequest {
  readonly candidateId: string
  readonly jobId: string
}

export interface InterviewAssistantResponse {
  readonly id: string
  readonly candidateId: string
  readonly jobId?: string | null
  readonly mode: InterviewAssistantMode
  readonly overallSummary: string
  readonly questions: readonly InterviewQuestion[]
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface InterviewHistoryItem {
  readonly id: string
  readonly candidateId: string
  readonly jobId?: string | null
  readonly jobTitle?: string | null
  readonly mode: InterviewAssistantMode
  readonly overallSummary: string
  readonly totalQuestions?: number
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt: string
}

export interface InterviewHistoryResponse {
  readonly candidateId: string
  readonly totalGenerations: number
  readonly history: readonly InterviewAssistantResponse[]
}
