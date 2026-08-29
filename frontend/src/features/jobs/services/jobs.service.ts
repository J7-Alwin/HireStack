import { apiClient } from '@/services/api'
import type {
  Job,
  JobFilterParams,
  CreateJobInput,
  UpdateJobInput,
  JobDepartment,
} from '../types/jobs.types'

export interface JobListResponse {
  readonly data: readonly Job[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}

export const jobsService = {
  /**
   * List jobs with filtering, search, pagination, and sorting
   * Backend: GET /jobs
   */
  listJobs: async (params?: JobFilterParams): Promise<JobListResponse> => {
    const response = await apiClient.get<readonly Job[]>('/jobs', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        department: params?.department || params?.departmentId,
        status: params?.status,
        employmentType: params?.employmentType,
        workplaceType: params?.workplaceType,
        recruiter: params?.recruiter,
        createdDate: params?.createdDate,
        closingDate: params?.closingDate,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    const raw = response as unknown as {
      meta?: JobListResponse['meta']
      pagination?: JobListResponse['meta']
    }

    return {
      data: response.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Get complete job details by ID
   * Backend: GET /jobs/:id
   */
  getJobById: async (id: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/jobs/${id}`)
    return response.data!
  },

  /**
   * Create a draft job requisition
   * Backend: POST /jobs
   */
  createJob: async (data: CreateJobInput): Promise<Job> => {
    const response = await apiClient.post<Job>('/jobs', data)
    return response.data!
  },

  /**
   * Update editable job information
   * Backend: PATCH /jobs/:id
   */
  updateJob: async (id: string, data: UpdateJobInput): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}`, data)
    return response.data!
  },

  /**
   * Publish a draft job
   * Backend: PATCH /jobs/:id/publish
   */
  publishJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/publish`)
    return response.data!
  },

  /**
   * Open a published job
   * Backend: PATCH /jobs/:id/open
   */
  openJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/open`)
    return response.data!
  },

  /**
   * Pause an open job
   * Backend: PATCH /jobs/:id/pause
   */
  pauseJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/pause`)
    return response.data!
  },

  /**
   * Reopen a paused job
   * Backend: PATCH /jobs/:id/reopen
   */
  reopenJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/reopen`)
    return response.data!
  },

  /**
   * Close a job
   * Backend: PATCH /jobs/:id/close
   */
  closeJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/close`)
    return response.data!
  },

  /**
   * Archive a closed job
   * Backend: PATCH /jobs/:id/archive
   */
  archiveJob: async (id: string): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}/archive`)
    return response.data!
  },

  /**
   * Soft-delete a job (COMPANY_ADMIN only)
   * Backend: DELETE /jobs/:id
   */
  softDeleteJob: async (id: string): Promise<Job> => {
    const response = await apiClient.delete<Job>(`/jobs/${id}`)
    return response.data!
  },

  /**
   * Fetch active company departments for dropdowns
   * Backend: GET /departments/options
   */
  getDepartmentOptions: async (): Promise<readonly JobDepartment[]> => {
    const response = await apiClient.get<readonly JobDepartment[]>('/departments/options')
    return response.data || []
  },
}
