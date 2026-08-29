import { apiClient } from '@/services/api'
import type {
  Offer,
  OfferListResponse,
  OfferFilterParams,
  CreateOfferInput,
  UpdateOfferInput,
} from '../types/offers.types'

export const offersService = {
  /**
   * Retrieves a paginated list of offers with search, filters, and sorting
   * Backend: GET /offers
   */
  listOffers: async (params?: OfferFilterParams): Promise<OfferListResponse> => {
    const res = await apiClient.get<Offer[]>('/offers', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search,
        status: params?.status,
        currency: params?.currency,
        employmentType: params?.employmentType,
        recruiterId: params?.recruiterId,
        joiningDate: params?.joiningDate,
        expiryDate: params?.expiryDate,
        createdAt: params?.createdAt,
        sortBy: params?.sortBy,
        sortOrder: params?.sortOrder,
      },
    })

    const raw = res as unknown as {
      meta?: OfferListResponse['meta']
      pagination?: OfferListResponse['meta']
    }

    return {
      data: res.data || [],
      meta: raw.meta || raw.pagination,
    }
  },

  /**
   * Retrieves a single offer by ID with relations
   * Backend: GET /offers/:id
   */
  getOfferById: async (id: string): Promise<Offer> => {
    const res = await apiClient.get<Offer>(`/offers/${id}`)
    return res.data!
  },

  /**
   * Creates a new offer in DRAFT status
   * Backend: POST /offers
   */
  createOffer: async (input: CreateOfferInput): Promise<Offer> => {
    const res = await apiClient.post<Offer>('/offers', input)
    return res.data!
  },

  /**
   * Updates an existing draft offer
   * Backend: PUT /offers/:id
   */
  updateDraft: async (id: string, input: UpdateOfferInput): Promise<Offer> => {
    const res = await apiClient.put<Offer>(`/offers/${id}`, input)
    return res.data!
  },

  /**
   * Submits a draft offer for company admin approval
   * Backend: POST /offers/:id/submit
   */
  submitForApproval: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/submit`)
    return res.data!
  },

  /**
   * Approves a submitted offer (Company Admin only)
   * Backend: POST /offers/:id/approve
   */
  approveOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/approve`)
    return res.data!
  },

  /**
   * Sends an approved offer to the candidate (Company Admin only)
   * Backend: POST /offers/:id/send
   */
  sendOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/send`)
    return res.data!
  },

  /**
   * Marks an offer as viewed by the candidate
   * Backend: POST /offers/:id/view
   */
  markViewed: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/view`)
    return res.data!
  },

  /**
   * Records candidate acceptance of the offer
   * Backend: POST /offers/:id/accept
   */
  acceptOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/accept`)
    return res.data!
  },

  /**
   * Records candidate rejection/decline of the offer
   * Backend: POST /offers/:id/decline
   */
  declineOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/decline`)
    return res.data!
  },

  /**
   * Withdraws an active offer (Company Admin only)
   * Backend: POST /offers/:id/withdraw
   */
  withdrawOffer: async (id: string): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/withdraw`)
    return res.data!
  },

  /**
   * Creates a revision version under the same offer code
   * Backend: POST /offers/:id/revision
   */
  createRevision: async (id: string, input: CreateOfferInput): Promise<Offer> => {
    const res = await apiClient.post<Offer>(`/offers/${id}/revision`, input)
    return res.data!
  },

  /**
   * Soft-deletes an offer (Company Admin only)
   * Backend: DELETE /offers/:id
   */
  softDeleteOffer: async (id: string): Promise<void> => {
    await apiClient.delete(`/offers/${id}`)
  },
}
