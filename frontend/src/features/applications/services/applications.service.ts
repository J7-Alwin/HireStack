import { apiClient } from '@/services/api'
import type {
  Application,
  ApplicationFilterParams,
  CreateApplicationInput,
  UpdateApplicationInput,
  AssignRecruiterInput,
  UpdateStageInput,
  UpdateStatusInput,
  RejectApplicationInput,
  WithdrawApplicationInput,
} from '../types/applications.types'

export interface ApplicationListResponse {
  readonly data: readonly Application[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}

export const applicationsService = {
  /**
   * List applications with filtering, search, pagination, and sorting
   * Backend: GET /applications
   */
  listApplications: async (
    params?: ApplicationFilterParams
  ): Promise<ApplicationListResponse> => {
    const response = await apiClient.get<readonly Application[]>('/applications', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        stage: params?.stage,
        status: params?.status,
        recruiter: params?.recruiter,
        candidate: params?.candidate,
        job: params?.job,
        source: params?.source,
        appliedDate: params?.appliedDate,
        createdDate: params?.createdDate,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    const raw = response as unknown as {
      meta?: ApplicationListResponse['meta']
      pagination?: ApplicationListResponse['meta']
    }

    return {
      data: response.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Get complete application details by ID
   * Backend: GET /applications/:id
   */
  getApplicationById: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/applications/${id}`)
    return response.data!
  },

  /**
   * Create an application connecting Candidate and Job
   * Backend: POST /applications
   */
  createApplication: async (data: CreateApplicationInput): Promise<Application> => {
    const response = await apiClient.post<Application>('/applications', data)
    return response.data!
  },

  /**
   * Update application remarks
   * Backend: PATCH /applications/:id
   */
  updateApplication: async (
    id: string,
    data: UpdateApplicationInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}`, data)
    return response.data!
  },

  /**
   * Assign or reassign recruiter (Company Admin only)
   * Backend: PATCH /applications/:id/assign
   */
  assignRecruiter: async (
    id: string,
    data: AssignRecruiterInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/assign`, data)
    return response.data!
  },

  /**
   * Update application pipeline stage
   * Backend: PATCH /applications/:id/stage
   */
  updateStage: async (
    id: string,
    data: UpdateStageInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/stage`, data)
    return response.data!
  },

  /**
   * Update application status
   * Backend: PATCH /applications/:id/status
   */
  updateStatus: async (
    id: string,
    data: UpdateStatusInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/status`, data)
    return response.data!
  },

  /**
   * Reject an application with reason code and optional note
   * Backend: PATCH /applications/:id/reject
   */
  rejectApplication: async (
    id: string,
    data: RejectApplicationInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/reject`, data)
    return response.data!
  },

  /**
   * Record candidate withdrawal with reason code and optional note
   * Backend: PATCH /applications/:id/withdraw
   */
  withdrawApplication: async (
    id: string,
    data: WithdrawApplicationInput
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/withdraw`, data)
    return response.data!
  },

  /**
   * Soft-delete application (Company Admin only)
   * Backend: DELETE /applications/:id
   */
  softDeleteApplication: async (id: string): Promise<Application> => {
    const response = await apiClient.delete<Application>(`/applications/${id}`)
    return response.data!
  },

  /**
   * Restore soft-deleted application (Company Admin only)
   * Backend: PATCH /applications/:id/restore
   */
  restoreApplication: async (id: string): Promise<Application> => {
    const response = await apiClient.patch<Application>(`/applications/${id}/restore`)
    return response.data!
  },
}
