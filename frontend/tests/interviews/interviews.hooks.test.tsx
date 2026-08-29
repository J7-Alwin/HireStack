import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useInterviews,
  useInterview,
  useCreateInterview,
  useUpdateInterview,
  useDeleteInterview,
  useUpdateInterviewStatus,
  useRescheduleInterview,
  useRecordInterviewOutcome,
  useCancelInterview,
  useAssignInterviewers,
  interviewKeys,
} from '@/features/interviews/hooks'
import { interviewsService } from '@/features/interviews/services/interviews.service'
import type { Interview } from '@/features/interviews/types/interviews.types'
import type { ReactNode } from 'react'

describe('Interviews Query & Mutation Hooks', () => {
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

  const mockInterview: Interview = {
    id: 'int_1',
    interviewCode: 'INT-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    interviewType: 'INTERNAL',
    round: 'TECHNICAL',
    status: 'SCHEDULED',
    outcome: null,
    mode: 'ONLINE',
    scheduledDate: '2026-03-01T00:00:00.000Z',
    startTime: '2026-03-01T10:00:00.000Z',
    endTime: '2026-03-01T11:00:00.000Z',
    timeZone: 'Asia/Kolkata',
    meetingLink: 'https://meet.google.com/test',
    location: null,
    notes: 'Technical assessment',
    resultNotes: null,
    cancellationReason: null,
    createdBy: 'usr_1',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-001',
      stage: 'TECHNICAL_INTERVIEW',
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
    interviewers: [
      {
        id: 'ii_1',
        interviewerId: 'usr_2',
        interviewer: {
          id: 'usr_2',
          name: 'Jane Reviewer',
          email: 'jane@company.com',
        },
      },
    ],
  }

  it('generates consistent interview query keys', () => {
    expect(interviewKeys.all).toEqual(['interviews'])
    expect(interviewKeys.lists()).toEqual(['interviews', 'list'])
    expect(interviewKeys.list({ status: 'SCHEDULED' })).toEqual([
      'interviews',
      'list',
      { status: 'SCHEDULED' },
    ])
    expect(interviewKeys.details()).toEqual(['interviews', 'detail'])
    expect(interviewKeys.detail('int_1')).toEqual(['interviews', 'detail', 'int_1'])
  })

  it('useInterviews fetches and returns paginated interviews', async () => {
    vi.spyOn(interviewsService, 'listInterviews').mockResolvedValueOnce({
      data: [mockInterview],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    })

    const { result } = renderHook(() => useInterviews({ page: 1 }), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.length).toBe(1)
    expect(result.current.data?.data[0].interviewCode).toBe('INT-000001')
  })

  it('useInterview fetches single interview by id', async () => {
    vi.spyOn(interviewsService, 'getInterviewById').mockResolvedValueOnce(mockInterview)

    const { result } = renderHook(() => useInterview('int_1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.id).toBe('int_1')
  })

  it('useCreateInterview invalidates interview lists on success', async () => {
    vi.spyOn(interviewsService, 'scheduleInterview').mockResolvedValueOnce(mockInterview)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useCreateInterview(), { wrapper })

    await result.current.mutateAsync({
      applicationId: 'app_1',
      interviewType: 'INTERNAL',
      round: 'TECHNICAL',
      mode: 'ONLINE',
      scheduledDate: '2026-03-01T00:00:00.000Z',
      startTime: '2026-03-01T10:00:00.000Z',
      endTime: '2026-03-01T11:00:00.000Z',
      timeZone: 'Asia/Kolkata',
      meetingLink: 'https://meet.google.com/test',
      interviewers: ['usr_2'],
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useUpdateInterview invalidates detail and lists on success', async () => {
    vi.spyOn(interviewsService, 'updateInterview').mockResolvedValueOnce({
      ...mockInterview,
      notes: 'Updated notes',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateInterview('int_1'), { wrapper })

    await result.current.mutateAsync({
      notes: 'Updated notes',
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('useDeleteInterview invalidates lists and removes detail on success', async () => {
    vi.spyOn(interviewsService, 'softDeleteInterview').mockResolvedValueOnce()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const removeSpy = vi.spyOn(queryClient, 'removeQueries')

    const { result } = renderHook(() => useDeleteInterview(), { wrapper })

    await result.current.mutateAsync('int_1')

    expect(removeSpy).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('status, reschedule, outcome, cancel, and interviewer assignment mutations work correctly', async () => {
    vi.spyOn(interviewsService, 'updateStatus').mockResolvedValueOnce({
      ...mockInterview,
      status: 'CONFIRMED',
    })
    vi.spyOn(interviewsService, 'rescheduleInterview').mockResolvedValueOnce({
      ...mockInterview,
      startTime: '2026-03-02T10:00:00.000Z',
    })
    vi.spyOn(interviewsService, 'recordOutcome').mockResolvedValueOnce({
      ...mockInterview,
      outcome: 'PASS',
    })
    vi.spyOn(interviewsService, 'cancelInterview').mockResolvedValueOnce({
      ...mockInterview,
      status: 'CANCELLED',
    })
    vi.spyOn(interviewsService, 'assignInterviewers').mockResolvedValueOnce(mockInterview)

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: statusHook } = renderHook(() => useUpdateInterviewStatus('int_1'), { wrapper })
    await statusHook.current.mutateAsync({ status: 'CONFIRMED' })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: rescheduleHook } = renderHook(() => useRescheduleInterview('int_1'), { wrapper })
    await rescheduleHook.current.mutateAsync({
      scheduledDate: '2026-03-02T00:00:00.000Z',
      startTime: '2026-03-02T10:00:00.000Z',
      endTime: '2026-03-02T11:00:00.000Z',
      timeZone: 'Asia/Kolkata',
    })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: outcomeHook } = renderHook(() => useRecordInterviewOutcome('int_1'), { wrapper })
    await outcomeHook.current.mutateAsync({ outcome: 'PASS' })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: cancelHook } = renderHook(() => useCancelInterview('int_1'), { wrapper })
    await cancelHook.current.mutateAsync({ cancellationReason: 'Candidate withdrew' })
    expect(invalidateSpy).toHaveBeenCalled()

    const { result: assignHook } = renderHook(() => useAssignInterviewers('int_1'), { wrapper })
    await assignHook.current.mutateAsync({ interviewers: ['usr_2', 'usr_3'] })
    expect(invalidateSpy).toHaveBeenCalled()
  })
})
