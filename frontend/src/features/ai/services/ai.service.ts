import { apiClient } from '@/services/api'
import type { Candidate } from '@/features/candidates'
import type {
  AiHealthCheckResponse,
  ATSScoreRequest,
  ATSScoreResponse,
  JobMatchingRequest,
  JobMatchingResponse,
  JobMatchHistoryResponse,
  JobMatchDetailsResponse,
  GeneralResumeRecommendationRequest,
  JobSpecificResumeRecommendationRequest,
  ResumeRecommendationResponse,
  ResumeRecommendationHistoryResponse,
  GeneralInterviewRequest,
  JobSpecificInterviewRequest,
  InterviewAssistantResponse,
  InterviewHistoryResponse,
  GenerateAiInsightsRequest,
  AiInsightResponse,
  AiInsightHistoryResponse,
} from '../types'

export const aiService = {
  /**
   * Health check for local AI service and model connectivity
   * Backend: GET /ai/health
   */
  health: async (): Promise<AiHealthCheckResponse> => {
    const res = await apiClient.get<AiHealthCheckResponse>('/ai/health')
    return res.data!
  },

  /**
   * Uploads and parses PDF resume to create a candidate record
   * Backend: POST /ai/resume/parse
   */
  parseResume: async (file: File): Promise<Candidate> => {
    const formData = new FormData()
    formData.append('resume', file)

    const res = await apiClient.post<Candidate>('/ai/resume/parse', formData)
    return res.data!
  },

  /**
   * Evaluates candidate resume against job description to generate 6-factor ATS score
   * Backend: POST /ai/ats-score
   */
  createAtsScore: async (input: ATSScoreRequest): Promise<ATSScoreResponse> => {
    const res = await apiClient.post<ATSScoreResponse>('/ai/ats-score', input)
    return res.data!
  },

  /**
   * Evaluates all applicant candidates for a job and generates match rankings
   * Backend: POST /ai/job-matching
   */
  createJobMatching: async (input: JobMatchingRequest): Promise<JobMatchingResponse> => {
    const res = await apiClient.post<JobMatchingResponse>('/ai/job-matching', input)
    return res.data!
  },

  /**
   * Retrieves historical applicant matching list for a job
   * Backend: GET /ai/job-matching/:jobId
   */
  getJobMatches: async (jobId: string): Promise<JobMatchHistoryResponse> => {
    const res = await apiClient.get<JobMatchHistoryResponse>(`/ai/job-matching/${jobId}`)
    return res.data || []
  },

  /**
   * Retrieves granular match breakdown and score details for a candidate on a job
   * Backend: GET /ai/job-matching/:jobId/:candidateId
   */
  getCandidateJobMatch: async (
    jobId: string,
    candidateId: string
  ): Promise<JobMatchDetailsResponse> => {
    const res = await apiClient.get<JobMatchDetailsResponse>(
      `/ai/job-matching/${jobId}/${candidateId}`
    )
    return res.data!
  },

  /**
   * Generates general resume formatting and improvement recommendations
   * Backend: POST /ai/resume-recommendations
   */
  createResumeRecommendations: async (
    input: GeneralResumeRecommendationRequest
  ): Promise<ResumeRecommendationResponse> => {
    const res = await apiClient.post<ResumeRecommendationResponse>(
      '/ai/resume-recommendations',
      input
    )
    return res.data!
  },

  /**
   * Generates job-specific resume recommendations and alignment gap analysis
   * Backend: POST /ai/resume-recommendations/job
   */
  createJobResumeRecommendations: async (
    input: JobSpecificResumeRecommendationRequest
  ): Promise<ResumeRecommendationResponse> => {
    const res = await apiClient.post<ResumeRecommendationResponse>(
      '/ai/resume-recommendations/job',
      input
    )
    return res.data!
  },

  /**
   * Retrieves historical resume recommendation reviews for a candidate
   * Backend: GET /ai/resume-recommendations/history/:candidateId
   */
  getResumeRecommendationHistory: async (
    candidateId: string
  ): Promise<ResumeRecommendationHistoryResponse> => {
    const res = await apiClient.get<ResumeRecommendationHistoryResponse>(
      `/ai/resume-recommendations/history/${candidateId}`
    )
    return res.data || []
  },

  /**
   * Retrieves detailed resume recommendation report by ID
   * Backend: GET /ai/resume-recommendations/:id
   */
  getResumeRecommendation: async (
    id: string
  ): Promise<ResumeRecommendationResponse> => {
    const res = await apiClient.get<ResumeRecommendationResponse>(
      `/ai/resume-recommendations/${id}`
    )
    return res.data!
  },

  /**
   * Generates general interview kit & questions based on candidate profile
   * Backend: POST /ai/interview
   */
  createInterviewAssistant: async (
    input: GeneralInterviewRequest
  ): Promise<InterviewAssistantResponse> => {
    const res = await apiClient.post<InterviewAssistantResponse>(
      '/ai/interview',
      input
    )
    return res.data!
  },

  /**
   * Generates job-specific interview kit & questions evaluating candidate for a role
   * Backend: POST /ai/interview/job
   */
  createJobInterviewAssistant: async (
    input: JobSpecificInterviewRequest
  ): Promise<InterviewAssistantResponse> => {
    const res = await apiClient.post<InterviewAssistantResponse>(
      '/ai/interview/job',
      input
    )
    return res.data!
  },

  /**
   * Retrieves historical interview kits generated for a candidate
   * Backend: GET /ai/interview/history/:candidateId
   */
  getInterviewAssistantHistory: async (
    candidateId: string
  ): Promise<InterviewHistoryResponse> => {
    const res = await apiClient.get<InterviewHistoryResponse>(
      `/ai/interview/history/${candidateId}`
    )
    return (
      res.data || {
        candidateId,
        totalGenerations: 0,
        history: [],
      }
    )
  },

  /**
   * Retrieves detailed interview kit report by ID
   * Backend: GET /ai/interview/:id
   */
  getInterviewAssistant: async (
    id: string
  ): Promise<InterviewAssistantResponse> => {
    const res = await apiClient.get<InterviewAssistantResponse>(
      `/ai/interview/${id}`
    )
    return res.data!
  },

  /**
   * Generates comprehensive recruiter insight summary and risk analysis for candidate on a job
   * Backend: POST /ai/insights
   */
  createAiInsights: async (
    input: GenerateAiInsightsRequest
  ): Promise<AiInsightResponse> => {
    const res = await apiClient.post<AiInsightResponse>('/ai/insights', input)
    return res.data!
  },

  /**
   * Retrieves historical AI insights generated for a candidate
   * Backend: GET /ai/insights/history/:candidateId
   */
  getAiInsightHistory: async (
    candidateId: string
  ): Promise<AiInsightHistoryResponse> => {
    const res = await apiClient.get<AiInsightHistoryResponse>(
      `/ai/insights/history/${candidateId}`
    )
    return res.data || []
  },

  /**
   * Retrieves detailed AI insight evaluation report by ID
   * Backend: GET /ai/insights/:id
   */
  getAiInsight: async (id: string): Promise<AiInsightResponse> => {
    const res = await apiClient.get<AiInsightResponse>(`/ai/insights/${id}`)
    return res.data!
  },
}
