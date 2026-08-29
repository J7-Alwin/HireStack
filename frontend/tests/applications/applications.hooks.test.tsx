import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useApplications,
  useApplication,
  useCreateApplication,
  useUpdateApplication,
  useDeleteApplication,
  useUpdateStage,
  useUpdateStatus,
  useRejectApplication,
  useWithdrawApplication,
} from '@/features/applications/hooks'
import { applicationsService } from '@/features/applications/services/applications.service'
import type { Application } from '@/features/applications/types/applications.types'
import type { ReactNode } from 'react'

describe('Applications Query & Mutation Hooks', () => {
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

  const mockApp: Application = {
    id: 'a1',
    applicationCode: 'APP-001',
    companyId: 'c1',
    candidateId: 'cand_1',
    jobId: 'job_1',
    assignedRecruiterId: 'u1',
    stage: 'APPLIED',
    status: 'ACTIVE',
    appliedAt: '2026-01-01T00:00:00Z',
    createdBy: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  it('useApplications fetches and returns paginated applications', async () => {
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValueOnce({
      data: [mockApp],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    const { result } = renderHook(() => useApplications({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].applicationCode).toBe('APP-001')
  })

  it('useApplication fetches single application by id', async () => {
    vi.spyOn(applicationsService, 'getApplicationById').mockResolvedValueOnce(mockApp)

    const { result } = renderHook(() => useApplication('a1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('a1')
  })

  it('useCreateApplication invalidates application lists on success', async () => {
    vi.spyOn(applicationsService, 'createApplication').mockResolvedValueOnce(mockApp)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateApplication(), { wrapper })

    await result.current.mutateAsync({
      candidateId: 'cand_1',
      jobId: 'job_1',
      assignedRecruiterId: 'u1',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useUpdateApplication invalidates detail and lists on success', async () => {
    vi.spyOn(applicationsService, 'updateApplication').mockResolvedValueOnce({
      ...mockApp,
      remarks: 'Candidate passed initial phone screening.',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateApplication(), { wrapper })

    await result.current.mutateAsync({
      id: 'a1',
      data: { remarks: 'Candidate passed initial phone screening.' },
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeleteApplication invalidates application lists on success', async () => {
    vi.spyOn(applicationsService, 'softDeleteApplication').mockResolvedValueOnce(mockApp)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteApplication(), { wrapper })

    await result.current.mutateAsync('a1')

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('workflow mutations update stage and status correctly', async () => {
    vi.spyOn(applicationsService, 'updateStage').mockResolvedValueOnce({ ...mockApp, stage: 'SCREENING' })
    vi.spyOn(applicationsService, 'updateStatus').mockResolvedValueOnce({ ...mockApp, status: 'HIRED' })
    vi.spyOn(applicationsService, 'rejectApplication').mockResolvedValueOnce({ ...mockApp, status: 'REJECTED' })
    vi.spyOn(applicationsService, 'withdrawApplication').mockResolvedValueOnce({ ...mockApp, status: 'WITHDRAWN' })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: stageHook } = renderHook(() => useUpdateStage(), { wrapper })
    await stageHook.current.mutateAsync({ id: 'a1', stage: 'SCREENING' })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: statusHook } = renderHook(() => useUpdateStatus(), { wrapper })
    await statusHook.current.mutateAsync({ id: 'a1', status: 'HIRED' })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: rejectHook } = renderHook(() => useRejectApplication(), { wrapper })
    await rejectHook.current.mutateAsync({ id: 'a1', data: { rejectionReasonCode: 'OTHER' } })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: withdrawHook } = renderHook(() => useWithdrawApplication(), { wrapper })
    await withdrawHook.current.mutateAsync({ id: 'a1', data: { withdrawalReasonCode: 'OTHER' } })
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
