import { describe, it, expect, vi, beforeEach } from 'vitest'
import { interviewsService } from '@/features/interviews/services/interviews.service'
import { apiClient } from '@/services/api'
import type { Interview } from '@/features/interviews/types/interviews.types'

describe('interviewsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockInterview: Interview = {
    id: 'int_123',
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
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    location: null,
    notes: 'Please prepare live coding task.',
    resultNotes: null,
    cancellationReason: null,
    createdBy: 'usr_rec',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'TECHNICAL_INTERVIEW',
      status: 'ACTIVE',
      assignedRecruiterId: 'usr_rec',
      assignedRecruiter: {
        id: 'usr_rec',
        name: 'Alice Recruiter',
        email: 'alice@company.com',
      },
      candidate: {
        id: 'cand_1',
        candidateCode: 'CAN-000001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-000001',
        title: 'Senior Frontend Engineer',
      },
    },
    interviewers: [
      {
        id: 'ii_1',
        interviewerId: 'usr_int1',
        interviewer: {
          id: 'usr_int1',
          name: 'Bob Lead',
          email: 'bob@company.com',
        },
      },
    ],
  }

  it('calls GET /interviews with query parameters and returns mapped list response', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockInterview],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    } as any)

    const result = await interviewsService.listInterviews({
      page: 1,
      limit: 10,
      search: 'John',
      status: 'SCHEDULED',
      round: 'TECHNICAL',
      interviewType: 'INTERNAL',
      mode: 'ONLINE',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/interviews', {
      params: {
        page: 1,
        limit: 10,
        search: 'John',
        status: 'SCHEDULED',
        round: 'TECHNICAL',
        interviewType: 'INTERNAL',
        mode: 'ONLINE',
        outcome: undefined,
        recruiterId: undefined,
        interviewerId: undefined,
        scheduledDate: undefined,
        createdAt: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].interviewCode).toBe('INT-000001')
    expect(result.meta?.total).toBe(1)
  })

  it('calls GET /interviews/:id for single interview details', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockInterview,
    } as any)

    const result = await interviewsService.getInterviewById('int_123')
    expect(apiClient.get).toHaveBeenCalledWith('/interviews/int_123')
    expect(result.id).toBe('int_123')
    expect(result.application.candidate.firstName).toBe('John')
  })

  it('calls POST /interviews for scheduling an interview', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockInterview,
    } as any)

    const input = {
      applicationId: 'app_1',
      interviewType: 'INTERNAL' as const,
      round: 'TECHNICAL' as const,
      mode: 'ONLINE' as const,
      scheduledDate: '2026-03-01T00:00:00.000Z',
      startTime: '2026-03-01T10:00:00.000Z',
      endTime: '2026-03-01T11:00:00.000Z',
      timeZone: 'Asia/Kolkata',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      interviewers: ['usr_int1'],
    }

    const result = await interviewsService.scheduleInterview(input)
    expect(apiClient.post).toHaveBeenCalledWith('/interviews', input)
    expect(result.interviewCode).toBe('INT-000001')
  })

  it('calls PATCH /interviews/:id for editing details', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockInterview, notes: 'Updated notes' },
    } as any)

    const result = await interviewsService.updateInterview('int_123', {
      notes: 'Updated notes',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123', {
      notes: 'Updated notes',
    })
    expect(result.notes).toBe('Updated notes')
  })

  it('calls PATCH /interviews/:id/status for status transition', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockInterview, status: 'CONFIRMED' },
    } as any)

    const result = await interviewsService.updateStatus('int_123', {
      status: 'CONFIRMED',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123/status', {
      status: 'CONFIRMED',
    })
    expect(result.status).toBe('CONFIRMED')
  })

  it('calls PATCH /interviews/:id/reschedule for rescheduling', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: {
        ...mockInterview,
        startTime: '2026-03-02T14:00:00.000Z',
        endTime: '2026-03-02T15:00:00.000Z',
      },
    } as any)

    const input = {
      scheduledDate: '2026-03-02T00:00:00.000Z',
      startTime: '2026-03-02T14:00:00.000Z',
      endTime: '2026-03-02T15:00:00.000Z',
      timeZone: 'Asia/Kolkata',
      meetingLink: 'https://meet.google.com/new-link',
    }

    const result = await interviewsService.rescheduleInterview('int_123', input)
    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123/reschedule', input)
    expect(result.startTime).toBe('2026-03-02T14:00:00.000Z')
  })

  it('calls PATCH /interviews/:id/outcome for recording outcome', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: {
        ...mockInterview,
        outcome: 'PASS',
        resultNotes: 'Excellent problem solving skills.',
      },
    } as any)

    const result = await interviewsService.recordOutcome('int_123', {
      outcome: 'PASS',
      resultNotes: 'Excellent problem solving skills.',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123/outcome', {
      outcome: 'PASS',
      resultNotes: 'Excellent problem solving skills.',
    })
    expect(result.outcome).toBe('PASS')
  })

  it('calls PATCH /interviews/:id/cancel for cancelling an interview', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: {
        ...mockInterview,
        status: 'CANCELLED',
        cancellationReason: 'Candidate accepted another offer',
      },
    } as any)

    const result = await interviewsService.cancelInterview('int_123', {
      cancellationReason: 'Candidate accepted another offer',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123/cancel', {
      cancellationReason: 'Candidate accepted another offer',
    })
    expect(result.status).toBe('CANCELLED')
  })

  it('calls PATCH /interviews/:id/interviewers for updating assigned interviewers', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: mockInterview,
    } as any)

    const result = await interviewsService.assignInterviewers('int_123', {
      interviewers: ['usr_int1', 'usr_int2'],
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/interviews/int_123/interviewers', {
      interviewers: ['usr_int1', 'usr_int2'],
    })
    expect(result.id).toBe('int_123')
  })

  it('calls DELETE /interviews/:id for soft delete', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
    } as any)

    await interviewsService.softDeleteInterview('int_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/interviews/int_123')
  })
})
