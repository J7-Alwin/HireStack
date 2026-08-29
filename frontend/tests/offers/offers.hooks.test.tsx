import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useOffers,
  useOffer,
  useCreateOffer,
  useUpdateOffer,
  useDeleteOffer,
  useSubmitOffer,
  useApproveOffer,
  useSendOffer,
  useMarkOfferViewed,
  useAcceptOffer,
  useDeclineOffer,
  useWithdrawOffer,
  useCreateOfferRevision,
  offerKeys,
} from '@/features/offers/hooks'
import { offersService } from '@/features/offers/services/offers.service'
import type { Offer } from '@/features/offers/types/offers.types'
import type { ReactNode } from 'react'

describe('Offers Query & Mutation Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockOffer: Offer = {
    id: 'off_1',
    offerCode: 'OFF-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    version: 1,
    status: 'DRAFT',
    salary: 90000,
    currency: 'USD',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-05-01T00:00:00.000Z',
    expiryDate: '2026-04-15T00:00:00.000Z',
    benefits: 'Comprehensive health & dental',
    notes: 'Base salary approved',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-001',
      stage: 'OFFER',
      status: 'ACTIVE',
      candidate: {
        id: 'cand_1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      },
      job: {
        id: 'job_1',
        title: 'Senior Frontend Engineer',
      },
    },
  }

  it('generates consistent offer query keys', () => {
    expect(offerKeys.all).toEqual(['offers'])
    expect(offerKeys.lists()).toEqual(['offers', 'list'])
    expect(offerKeys.list({ status: 'DRAFT' })).toEqual([
      'offers',
      'list',
      { status: 'DRAFT' },
    ])
    expect(offerKeys.details()).toEqual(['offers', 'detail'])
    expect(offerKeys.detail('off_1')).toEqual(['offers', 'detail', 'off_1'])
  })

  it('useOffers fetches and returns paginated offers', async () => {
    vi.spyOn(offersService, 'listOffers').mockResolvedValueOnce({
      data: [mockOffer],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    const { result } = renderHook(() => useOffers({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].offerCode).toBe('OFF-000001')
  })

  it('useOffer fetches single offer by id', async () => {
    vi.spyOn(offersService, 'getOfferById').mockResolvedValueOnce(mockOffer)

    const { result } = renderHook(() => useOffer('off_1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('off_1')
  })

  it('useCreateOffer invalidates offer lists and applications on success', async () => {
    vi.spyOn(offersService, 'createOffer').mockResolvedValueOnce(mockOffer)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateOffer(), { wrapper })

    await result.current.mutateAsync({
      applicationId: 'app_1',
      salary: 90000,
      currency: 'USD',
      employmentType: 'FULL_TIME',
      joiningDate: '2026-05-01T00:00:00.000Z',
      expiryDate: '2026-04-15T00:00:00.000Z',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useUpdateOffer updates detail and invalidates lists on success', async () => {
    vi.spyOn(offersService, 'updateDraft').mockResolvedValueOnce({
      ...mockOffer,
      salary: 95000,
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateOffer('off_1'), { wrapper })

    await result.current.mutateAsync({
      salary: 95000,
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeleteOffer invalidates lists and removes detail on success', async () => {
    vi.spyOn(offersService, 'softDeleteOffer').mockResolvedValueOnce()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result } = renderHook(() => useDeleteOffer(), { wrapper })

    await result.current.mutateAsync('off_1')

    expect(removeSpy).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('workflow action mutations trigger correct endpoints and cache invalidations', async () => {
    vi.spyOn(offersService, 'submitForApproval').mockResolvedValueOnce({ ...mockOffer, status: 'PENDING_APPROVAL' })
    vi.spyOn(offersService, 'approveOffer').mockResolvedValueOnce({ ...mockOffer, status: 'APPROVED' })
    vi.spyOn(offersService, 'sendOffer').mockResolvedValueOnce({ ...mockOffer, status: 'SENT' })
    vi.spyOn(offersService, 'markViewed').mockResolvedValueOnce({ ...mockOffer, status: 'VIEWED' })
    vi.spyOn(offersService, 'acceptOffer').mockResolvedValueOnce({ ...mockOffer, status: 'ACCEPTED' })
    vi.spyOn(offersService, 'declineOffer').mockResolvedValueOnce({ ...mockOffer, status: 'DECLINED' })
    vi.spyOn(offersService, 'withdrawOffer').mockResolvedValueOnce({ ...mockOffer, status: 'WITHDRAWN' })
    vi.spyOn(offersService, 'createRevision').mockResolvedValueOnce({ ...mockOffer, id: 'off_2', version: 2 })

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: submitHook } = renderHook(() => useSubmitOffer('off_1'), { wrapper })
    await submitHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: approveHook } = renderHook(() => useApproveOffer('off_1'), { wrapper })
    await approveHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: sendHook } = renderHook(() => useSendOffer('off_1'), { wrapper })
    await sendHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: viewHook } = renderHook(() => useMarkOfferViewed('off_1'), { wrapper })
    await viewHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: acceptHook } = renderHook(() => useAcceptOffer('off_1'), { wrapper })
    await acceptHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: declineHook } = renderHook(() => useDeclineOffer('off_1'), { wrapper })
    await declineHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: withdrawHook } = renderHook(() => useWithdrawOffer('off_1'), { wrapper })
    await withdrawHook.current.mutateAsync()
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: revisionHook } = renderHook(() => useCreateOfferRevision('off_1'), { wrapper })
    await revisionHook.current.mutateAsync({
      applicationId: 'app_1',
      salary: 100000,
      currency: 'USD',
      employmentType: 'FULL_TIME',
      joiningDate: '2026-05-01T00:00:00.000Z',
      expiryDate: '2026-04-15T00:00:00.000Z',
    })
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
