import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useCandidates,
  useCandidate,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
} from '@/features/candidates/hooks'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import type { Candidate } from '@/features/candidates/types/candidates.types'
import type { ReactNode } from 'react'

describe('Candidates Query & Mutation Hooks', () => {
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

  const mockCandidate: Candidate = {
    id: 'c1',
    companyId: 'comp_1',
    candidateCode: 'CAND-001',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@gmail.com',
    phone: '555-1234',
    status: 'ACTIVE',
    isActive: true,
    primaryRecruiterId: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  it('useCandidates fetches and returns paginated candidates', async () => {
    vi.spyOn(candidatesService, 'listCandidates').mockResolvedValueOnce({
      data: [mockCandidate],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    const { result } = renderHook(() => useCandidates({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].firstName).toBe('Jane')
  })

  it('useCandidate fetches single candidate by id', async () => {
    vi.spyOn(candidatesService, 'getCandidateById').mockResolvedValueOnce(mockCandidate)

    const { result } = renderHook(() => useCandidate('c1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('c1')
  })

  it('useCreateCandidate invalidates candidate lists on success', async () => {
    vi.spyOn(candidatesService, 'createCandidate').mockResolvedValueOnce(mockCandidate)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateCandidate(), { wrapper })

    await result.current.mutateAsync({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@gmail.com',
      primaryRecruiterId: 'u1',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useUpdateCandidate invalidates detail and lists on success', async () => {
    vi.spyOn(candidatesService, 'updateCandidate').mockResolvedValueOnce({
      ...mockCandidate,
      firstName: 'Janet',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateCandidate(), { wrapper })

    await result.current.mutateAsync({
      id: 'c1',
      data: { firstName: 'Janet' },
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeleteCandidate invalidates candidate lists on success', async () => {
    vi.spyOn(candidatesService, 'softDeleteCandidate').mockResolvedValueOnce(mockCandidate)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteCandidate(), { wrapper })

    await result.current.mutateAsync('c1')

    expect(invalidateSpy).toHaveBeenCalled()
  })
})
