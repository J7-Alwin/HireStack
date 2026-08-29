import { apiClient } from '@/services/api'
import type {
  Candidate,
  CandidateFilterParams,
  CreateCandidateInput,
  UpdateCandidateInput,
  CandidateNote,
  CandidateTag,
} from '../types/candidates.types'

export interface CandidateListResponse {
  readonly data: readonly Candidate[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}

export const candidatesService = {
  /**
   * List candidates with filtering, search, pagination, and sorting
   * Backend: GET /candidates
   */
  listCandidates: async (
    params?: CandidateFilterParams
  ): Promise<CandidateListResponse> => {
    const response = await apiClient.get<readonly Candidate[]>('/candidates', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        status: params?.status,
        employmentStatus: params?.employmentStatus,
        source: params?.source,
        recruiter: params?.recruiter || params?.recruiterId,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
        showDeleted: params?.showDeleted,
      },
    })

    const raw = response as unknown as {
      meta?: CandidateListResponse['meta']
      pagination?: CandidateListResponse['meta']
    }

    return {
      data: response.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Get single candidate by ID with relations
   * Backend: GET /candidates/:id
   */
  getCandidateById: async (id: string): Promise<Candidate> => {
    const response = await apiClient.get<Candidate>(`/candidates/${id}`)
    return response.data!
  },

  /**
   * Create a new candidate profile
   * Backend: POST /candidates
   */
  createCandidate: async (data: CreateCandidateInput): Promise<Candidate> => {
    const response = await apiClient.post<Candidate>('/candidates', data)
    return response.data!
  },

  /**
   * Update an existing candidate profile
   * Backend: PATCH /candidates/:id
   */
  updateCandidate: async (
    id: string,
    data: UpdateCandidateInput
  ): Promise<Candidate> => {
    const response = await apiClient.patch<Candidate>(`/candidates/${id}`, data)
    return response.data!
  },

  /**
   * Soft-delete a candidate profile (COMPANY_ADMIN only)
   * Backend: DELETE /candidates/:id
   */
  softDeleteCandidate: async (id: string): Promise<Candidate> => {
    const response = await apiClient.delete<Candidate>(`/candidates/${id}`)
    return response.data!
  },

  /**
   * Add note to candidate profile
   * Backend: POST /candidates/:id/notes
   */
  addNote: async (candidateId: string, content: string): Promise<CandidateNote> => {
    const response = await apiClient.post<CandidateNote>(
      `/candidates/${candidateId}/notes`,
      { content }
    )
    return response.data!
  },

  /**
   * Delete note from candidate profile
   * Backend: DELETE /candidates/:id/notes/:noteId
   */
  deleteNote: async (
    candidateId: string,
    noteId: string
  ): Promise<void> => {
    await apiClient.delete(`/candidates/${candidateId}/notes/${noteId}`)
  },

  /**
   * Assign tag to candidate
   * Backend: POST /candidates/:id/tags
   */
  assignTag: async (candidateId: string, name: string): Promise<CandidateTag> => {
    const response = await apiClient.post<CandidateTag>(
      `/candidates/${candidateId}/tags`,
      { name }
    )
    return response.data!
  },

  /**
   * Remove tag from candidate
   * Backend: DELETE /candidates/:id/tags/:tagId
   */
  removeTag: async (candidateId: string, tagId: string): Promise<void> => {
    await apiClient.delete(`/candidates/${candidateId}/tags/${tagId}`)
  },
}
