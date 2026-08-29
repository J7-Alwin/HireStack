import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useDeleteJob,
  usePublishJob,
  usePauseJob,
  useDepartmentOptions,
} from '@/features/jobs/hooks'
import { jobsService } from '@/features/jobs/services/jobs.service'
import type { Job } from '@/features/jobs/types/jobs.types'
import type { ReactNode } from 'react'

describe('Jobs Query & Mutation Hooks', () => {
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

  const mockJob: Job = {
    id: 'j1',
    companyId: 'comp_1',
    departmentId: 'dept_eng',
    department: { id: 'dept_eng', name: 'Engineering' },
    jobCode: 'JOB-001',
    title: 'Frontend Developer',
    description: 'Build user interfaces.',
    employmentType: 'FULL_TIME',
    workplaceType: 'HYBRID',
    openings: 1,
    status: 'OPEN',
    isActive: true,
    createdBy: 'u1',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  it('useJobs fetches and returns paginated jobs', async () => {
    vi.spyOn(jobsService, 'listJobs').mockResolvedValueOnce({
      data: [mockJob],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    const { result } = renderHook(() => useJobs({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].title).toBe('Frontend Developer')
  })

  it('useJob fetches single job by id', async () => {
    vi.spyOn(jobsService, 'getJobById').mockResolvedValueOnce(mockJob)

    const { result } = renderHook(() => useJob('j1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('j1')
  })

  it('useCreateJob invalidates job lists on success', async () => {
    vi.spyOn(jobsService, 'createJob').mockResolvedValueOnce(mockJob)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateJob(), { wrapper })

    await result.current.mutateAsync({
      title: 'Frontend Developer',
      departmentId: 'dept_eng',
      description: 'Build user interfaces.',
      employmentType: 'FULL_TIME',
      workplaceType: 'HYBRID',
      openings: 1,
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useUpdateJob invalidates detail and lists on success', async () => {
    vi.spyOn(jobsService, 'updateJob').mockResolvedValueOnce({
      ...mockJob,
      title: 'Senior Frontend Developer',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateJob(), { wrapper })

    await result.current.mutateAsync({
      id: 'j1',
      data: { title: 'Senior Frontend Developer' },
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeleteJob invalidates job lists on success', async () => {
    vi.spyOn(jobsService, 'softDeleteJob').mockResolvedValueOnce(mockJob)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeleteJob(), { wrapper })

    await result.current.mutateAsync('j1')

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('usePublishJob and usePauseJob trigger transitions and invalidations', async () => {
    vi.spyOn(jobsService, 'publishJob').mockResolvedValueOnce({ ...mockJob, status: 'PUBLISHED' })
    vi.spyOn(jobsService, 'pauseJob').mockResolvedValueOnce({ ...mockJob, status: 'PAUSED' })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: publishHook } = renderHook(() => usePublishJob(), { wrapper })
    await publishHook.current.mutateAsync('j1')
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: pauseHook } = renderHook(() => usePauseJob(), { wrapper })
    await pauseHook.current.mutateAsync('j1')
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDepartmentOptions fetches department options', async () => {
    vi.spyOn(jobsService, 'getDepartmentOptions').mockResolvedValueOnce([
      { id: 'd1', name: 'Engineering' },
    ])

    const { result } = renderHook(() => useDepartmentOptions(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBe(1)
    expect(result.current.data?.[0].name).toBe('Engineering')
  })
})
