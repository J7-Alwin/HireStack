import { apiClient } from '@/services/api'
import type {
  Pipeline,
  PipelineHistory,
  PipelineTimeline,
  PipelineQueryFilters,
  PipelineListResponse,
  CreatePipelineInput,
  MoveStageInput,
  AddNotesInput,
} from '../types/pipeline.types'

export const pipelineService = {
  /**
   * Retrieves paginated list of hiring pipelines with search and filtering
   * Backend: GET /pipeline
   */
  listPipelines: async (filters?: PipelineQueryFilters): Promise<PipelineListResponse> => {
    const res = await apiClient.get<Pipeline[]>('/pipeline', {
      params: {
        page: filters?.page,
        limit: filters?.limit,
        search: filters?.search,
        currentStage: filters?.currentStage,
        recruiterId: filters?.recruiterId,
        departmentId: filters?.departmentId,
        jobId: filters?.jobId,
        candidateId: filters?.candidateId,
        completed: filters?.completed,
        active: filters?.active,
        hired: filters?.hired,
        rejected: filters?.rejected,
        withdrawn: filters?.withdrawn,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        sortBy: filters?.sortBy,
        sortOrder: filters?.sortOrder,
      },
    })

    const raw = res as unknown as {
      meta?: PipelineListResponse['meta']
      pagination?: PipelineListResponse['meta']
    }

    return {
      data: res.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Retrieves single hiring pipeline by ID with relations
   * Backend: GET /pipeline/:id
   */
  getPipelineById: async (id: string): Promise<Pipeline> => {
    const res = await apiClient.get<Pipeline>(`/pipeline/${id}`)
    return res.data!
  },

  /**
   * Creates a hiring pipeline for an application
   * Backend: POST /pipeline
   */
  createPipeline: async (input: CreatePipelineInput): Promise<Pipeline> => {
    const res = await apiClient.post<Pipeline>('/pipeline', input)
    return res.data!
  },

  /**
   * Moves a pipeline to another stage (or admin stage override)
   * Backend: PATCH /pipeline/:id/stage
   */
  moveStage: async (id: string, input: MoveStageInput): Promise<Pipeline> => {
    const res = await apiClient.patch<Pipeline>(`/pipeline/${id}/stage`, input)
    return res.data!
  },

  /**
   * Adds recruiter/admin notes to a pipeline candidate record
   * Backend: POST /pipeline/:id/notes
   */
  addNotes: async (id: string, input: AddNotesInput): Promise<Pipeline> => {
    const res = await apiClient.post<Pipeline>(`/pipeline/${id}/notes`, input)
    return res.data!
  },

  /**
   * Retrieves complete stage movement history for a pipeline
   * Backend: GET /pipeline/:id/history
   */
  getHistory: async (id: string): Promise<PipelineHistory[]> => {
    const res = await apiClient.get<PipelineHistory[]>(`/pipeline/${id}/history`)
    return res.data || []
  },

  /**
   * Retrieves activity timeline for a pipeline
   * Backend: GET /pipeline/:id/timeline
   */
  getTimeline: async (id: string): Promise<PipelineTimeline[]> => {
    const res = await apiClient.get<PipelineTimeline[]>(`/pipeline/${id}/timeline`)
    return res.data || []
  },

  /**
   * Soft-deletes a hiring pipeline (Company Admin only)
   * Backend: DELETE /pipeline/:id
   */
  softDeletePipeline: async (id: string): Promise<void> => {
    await apiClient.delete(`/pipeline/${id}`)
  },

  /**
   * Retrieves overall hiring pipeline dashboard summary
   * Backend: GET /pipeline/dashboard
   */
  getDashboardSummary: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/pipeline/dashboard')
    return res.data || {}
  },

  /**
   * Retrieves company-wide hiring dashboard metrics (Company Admin only)
   * Backend: GET /pipeline/dashboard/company
   */
  getCompanyDashboard: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/pipeline/dashboard/company')
    return res.data || {}
  },

  /**
   * Retrieves recruiter-specific dashboard metrics
   * Backend: GET /pipeline/dashboard/recruiter
   */
  getRecruiterDashboard: async (): Promise<Record<string, unknown>> => {
    const res = await apiClient.get<Record<string, unknown>>('/pipeline/dashboard/recruiter')
    return res.data || {}
  },
}
