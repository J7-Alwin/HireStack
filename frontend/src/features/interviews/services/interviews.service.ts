import { apiClient } from '@/services/api'
import type {
  Interview,
  InterviewFilterParams,
  CreateInterviewInput,
  UpdateInterviewInput,
  UpdateInterviewStatusInput,
  RescheduleInterviewInput,
  RecordInterviewOutcomeInput,
  CancelInterviewInput,
  AssignInterviewersInput,
  InterviewListResponse,
} from '../types/interviews.types'

export const interviewsService = {
  /**
   * List interviews with filtering, search, pagination, and sorting
   * Backend: GET /interviews
   */
  listInterviews: async (params?: InterviewFilterParams): Promise<InterviewListResponse> => {
    const response = await apiClient.get<readonly Interview[]>('/interviews', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        interviewType: params?.interviewType,
        round: params?.round,
        status: params?.status,
        outcome: params?.outcome,
        mode: params?.mode,
        recruiterId: params?.recruiterId,
        interviewerId: params?.interviewerId,
        scheduledDate: params?.scheduledDate,
        createdAt: params?.createdAt,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    const raw = response as unknown as {
      meta?: InterviewListResponse['meta']
      pagination?: InterviewListResponse['meta']
    }

    return {
      data: response.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Get complete interview details by ID
   * Backend: GET /interviews/:id
   */
  getInterviewById: async (id: string): Promise<Interview> => {
    const response = await apiClient.get<Interview>(`/interviews/${id}`)
    return response.data!
  },

  /**
   * Schedule a new interview for an application
   * Backend: POST /interviews
   */
  scheduleInterview: async (data: CreateInterviewInput): Promise<Interview> => {
    const response = await apiClient.post<Interview>('/interviews', data)
    return response.data!
  },

  /**
   * Update editable interview information (mode, meetingLink, location, notes)
   * Backend: PATCH /interviews/:id
   */
  updateInterview: async (id: string, data: UpdateInterviewInput): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}`, data)
    return response.data!
  },

  /**
   * Update interview status
   * Backend: PATCH /interviews/:id/status
   */
  updateStatus: async (id: string, data: UpdateInterviewStatusInput): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}/status`, data)
    return response.data!
  },

  /**
   * Reschedule interview (date, start/end time, timeZone, location/meetingLink, notes)
   * Backend: PATCH /interviews/:id/reschedule
   */
  rescheduleInterview: async (
    id: string,
    data: RescheduleInterviewInput
  ): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}/reschedule`, data)
    return response.data!
  },

  /**
   * Record interview outcome and recruiter result notes
   * Backend: PATCH /interviews/:id/outcome
   */
  recordOutcome: async (
    id: string,
    data: RecordInterviewOutcomeInput
  ): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}/outcome`, data)
    return response.data!
  },

  /**
   * Cancel scheduled interview with cancellation reason
   * Backend: PATCH /interviews/:id/cancel
   */
  cancelInterview: async (id: string, data: CancelInterviewInput): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}/cancel`, data)
    return response.data!
  },

  /**
   * Assign or update interviewers
   * Backend: PATCH /interviews/:id/interviewers
   */
  assignInterviewers: async (
    id: string,
    data: AssignInterviewersInput
  ): Promise<Interview> => {
    const response = await apiClient.patch<Interview>(`/interviews/${id}/interviewers`, data)
    return response.data!
  },

  /**
   * Soft-delete interview (Company Admin only)
   * Backend: DELETE /interviews/:id
   */
  softDeleteInterview: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`/interviews/${id}`)
  },
}
