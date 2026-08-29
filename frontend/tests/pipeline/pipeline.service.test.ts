import { describe, it, expect, vi, beforeEach } from 'vitest'
import { pipelineService } from '@/features/pipeline/services/pipeline.service'
import { apiClient } from '@/services/api'
import type { Pipeline } from '@/features/pipeline/types/pipeline.types'

describe('pipelineService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockPipeline: Pipeline = {
    id: 'pipe_123',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    jobId: 'job_1',
    currentStage: 'SCREENING',
    previousStage: 'APPLIED',
    stageChangedAt: '2026-03-01T10:00:00Z',
    stageOrder: 2,
    notes: 'Strong candidate background',
    isCompleted: false,
    completedReason: null,
    createdAt: '2026-02-28T09:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'SCREENING',
      status: 'ACTIVE',
      assignedRecruiterId: 'usr_rec',
    },
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-000001',
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'diana@themyscira.gov',
      phone: '+1-555-0101',
    },
    job: {
      id: 'job_1',
      jobCode: 'JOB-000001',
      title: 'Diplomatic Strategist',
    },
    recruiter: {
      id: 'usr_rec',
      name: 'Alice Recruiter',
      email: 'alice@company.com',
    },
  }

  it('calls GET /pipeline with query parameters and returns mapped list response', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockPipeline],
      meta: { total: 1, totalPages: 1, page: 1, limit: 20 },
    } as any)

    const result = await pipelineService.listPipelines({
      page: 1,
      limit: 20,
      search: 'Diana',
      currentStage: 'SCREENING',
      active: true,
    })

    expect(apiClient.get).toHaveBeenCalledWith('/pipeline', {
      params: {
        page: 1,
        limit: 20,
        search: 'Diana',
        currentStage: 'SCREENING',
        recruiterId: undefined,
        departmentId: undefined,
        jobId: undefined,
        candidateId: undefined,
        completed: undefined,
        active: true,
        hired: undefined,
        rejected: undefined,
        withdrawn: undefined,
        startDate: undefined,
        endDate: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].id).toBe('pipe_123')
  })

  it('calls GET /pipeline/:id for single pipeline details', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockPipeline,
    } as any)

    const result = await pipelineService.getPipelineById('pipe_123')
    expect(apiClient.get).toHaveBeenCalledWith('/pipeline/pipe_123')
    expect(result.candidate?.firstName).toBe('Diana')
  })

  it('calls POST /pipeline for pipeline creation', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockPipeline,
    } as any)

    const result = await pipelineService.createPipeline({
      applicationId: 'app_1',
      notes: 'Initial creation',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/pipeline', {
      applicationId: 'app_1',
      notes: 'Initial creation',
    })
    expect(result.id).toBe('pipe_123')
  })

  it('calls PATCH /pipeline/:id/stage for stage transition', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockPipeline, currentStage: 'SHORTLISTED', previousStage: 'SCREENING', stageOrder: 3 },
    } as any)

    const result = await pipelineService.moveStage('pipe_123', {
      toStage: 'SHORTLISTED',
      reason: 'Passed technical review',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/pipeline/pipe_123/stage', {
      toStage: 'SHORTLISTED',
      reason: 'Passed technical review',
    })
    expect(result.currentStage).toBe('SHORTLISTED')
  })

  it('calls POST /pipeline/:id/notes for adding notes', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockPipeline, notes: 'Follow up needed' },
    } as any)

    const result = await pipelineService.addNotes('pipe_123', {
      notes: 'Follow up needed',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/pipeline/pipe_123/notes', {
      notes: 'Follow up needed',
    })
    expect(result.notes).toBe('Follow up needed')
  })

  it('calls GET /pipeline/:id/history for movement history', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'hist_1',
          pipelineId: 'pipe_123',
          fromStage: 'APPLIED',
          toStage: 'SCREENING',
          movedById: 'usr_rec',
          movedAt: '2026-03-01T10:00:00Z',
        },
      ],
    } as any)

    const result = await pipelineService.getHistory('pipe_123')
    expect(apiClient.get).toHaveBeenCalledWith('/pipeline/pipe_123/history')
    expect(result.length).toBe(1)
    expect(result[0].toStage).toBe('SCREENING')
  })

  it('calls GET /pipeline/:id/timeline for timeline events', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [
        {
          id: 'tl_1',
          pipelineId: 'pipe_123',
          eventType: 'APPLICATION_SUBMITTED',
          title: 'Application Submitted',
          createdById: 'usr_rec',
          createdAt: '2026-02-28T09:00:00Z',
        },
      ],
    } as any)

    const result = await pipelineService.getTimeline('pipe_123')
    expect(apiClient.get).toHaveBeenCalledWith('/pipeline/pipe_123/timeline')
    expect(result.length).toBe(1)
    expect(result[0].eventType).toBe('APPLICATION_SUBMITTED')
  })

  it('calls DELETE /pipeline/:id for soft deletion', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
    } as any)

    await pipelineService.softDeletePipeline('pipe_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/pipeline/pipe_123')
  })

  it('calls GET /pipeline/dashboard metrics endpoints', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      success: true,
      data: { activePipelines: 10 },
    } as any)

    const summary = await pipelineService.getDashboardSummary()
    const company = await pipelineService.getCompanyDashboard()
    const recruiter = await pipelineService.getRecruiterDashboard()

    expect(summary).toEqual({ activePipelines: 10 })
    expect(company).toEqual({ activePipelines: 10 })
    expect(recruiter).toEqual({ activePipelines: 10 })
  })
})
