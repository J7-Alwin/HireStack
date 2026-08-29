import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePipelines,
  usePipeline,
  usePipelineHistory,
  usePipelineTimeline,
  useMovePipelineStage,
  useAddPipelineNotes,
  useDeletePipeline,
  pipelineKeys,
} from '@/features/pipeline/hooks'
import { pipelineService } from '@/features/pipeline/services/pipeline.service'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'
import type { ReactNode } from 'react'

describe('Pipeline Query & Mutation Hooks', () => {
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

  const mockPipeline: Pipeline = {
    id: 'pipe_1',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    jobId: 'job_1',
    currentStage: 'APPLIED',
    stageChangedAt: '2026-03-01T00:00:00Z',
    stageOrder: 1,
    isCompleted: false,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Barry',
      lastName: 'Allen',
    },
    job: {
      id: 'job_1',
      jobCode: 'JOB-001',
      title: 'Forensic Chemist',
    },
  }

  it('generates consistent query keys', () => {
    expect(pipelineKeys.all).toEqual(['pipeline'])
    expect(pipelineKeys.lists()).toEqual(['pipeline', 'list'])
    expect(pipelineKeys.list({ currentStage: 'APPLIED' })).toEqual([
      'pipeline',
      'list',
      { currentStage: 'APPLIED' },
    ])
    expect(pipelineKeys.details()).toEqual(['pipeline', 'detail'])
    expect(pipelineKeys.detail('pipe_1')).toEqual(['pipeline', 'detail', 'pipe_1'])
    expect(pipelineKeys.history('pipe_1')).toEqual(['pipeline', 'history', 'pipe_1'])
    expect(pipelineKeys.timeline('pipe_1')).toEqual(['pipeline', 'timeline', 'pipe_1'])
  })

  it('usePipelines fetches and returns list of pipelines', async () => {
    vi.spyOn(pipelineService, 'listPipelines').mockResolvedValueOnce({
      data: [mockPipeline],
      meta: { total: 1, totalPages: 1, page: 1, limit: 20 },
    })

    const { result } = renderHook(() => usePipelines({ active: true }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].id).toBe('pipe_1')
  })

  it('usePipeline fetches single pipeline detail', async () => {
    vi.spyOn(pipelineService, 'getPipelineById').mockResolvedValueOnce(mockPipeline)

    const { result } = renderHook(() => usePipeline('pipe_1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('pipe_1')
  })

  it('usePipelineHistory fetches movement history', async () => {
    vi.spyOn(pipelineService, 'getHistory').mockResolvedValueOnce([
      {
        id: 'hist_1',
        pipelineId: 'pipe_1',
        fromStage: null,
        toStage: 'APPLIED',
        movedById: 'usr_rec',
        movedAt: '2026-03-01T00:00:00Z',
      },
    ])

    const { result } = renderHook(() => usePipelineHistory('pipe_1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBe(1)
  })

  it('usePipelineTimeline fetches timeline events', async () => {
    vi.spyOn(pipelineService, 'getTimeline').mockResolvedValueOnce([
      {
        id: 'tl_1',
        pipelineId: 'pipe_1',
        eventType: 'APPLICATION_SUBMITTED',
        title: 'Application Submitted',
        createdById: 'usr_rec',
        createdAt: '2026-03-01T00:00:00Z',
      },
    ])

    const { result } = renderHook(() => usePipelineTimeline('pipe_1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.length).toBe(1)
  })

  it('useMovePipelineStage moves stage and invalidates pipeline lists and applications', async () => {
    vi.spyOn(pipelineService, 'moveStage').mockResolvedValueOnce({
      ...mockPipeline,
      currentStage: 'SCREENING',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useMovePipelineStage('pipe_1'), { wrapper })

    await result.current.mutateAsync({
      toStage: 'SCREENING',
      reason: 'Passed resume screen',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useAddPipelineNotes updates notes and invalidates queries', async () => {
    vi.spyOn(pipelineService, 'addNotes').mockResolvedValueOnce({
      ...mockPipeline,
      notes: 'Updated notes',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useAddPipelineNotes('pipe_1'), { wrapper })

    await result.current.mutateAsync({
      notes: 'Updated notes',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeletePipeline removes query and invalidates lists', async () => {
    vi.spyOn(pipelineService, 'softDeletePipeline').mockResolvedValueOnce()
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useDeletePipeline(), { wrapper })

    await result.current.mutateAsync('pipe_1')

    expect(removeSpy).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
