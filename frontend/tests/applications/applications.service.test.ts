import { describe, it, expect, vi, beforeEach } from 'vitest'
import { applicationsService } from '@/features/applications/services/applications.service'
import { apiClient } from '@/services/api'
import type { Application } from '@/features/applications/types/applications.types'

describe('applicationsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockApp: Application = {
    id: 'app_123',
    applicationCode: 'APP-000001',
    companyId: 'comp_1',
    candidateId: 'cand_1',
    candidate: {
      id: 'cand_1',
      candidateCode: 'CAN-000001',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      status: 'ACTIVE',
    },
    jobId: 'job_1',
    job: {
      id: 'job_1',
      jobCode: 'JOB-000001',
      title: 'Senior Frontend Engineer',
      status: 'OPEN',
    },
    assignedRecruiterId: 'usr_rec',
    stage: 'APPLIED',
    status: 'ACTIVE',
    source: 'LINKEDIN',
    appliedAt: '2026-02-01T10:00:00Z',
    createdBy: 'usr_rec',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  }

  it('calls GET /applications with query parameters', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockApp],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    } as any)

    const result = await applicationsService.listApplications({
      page: 1,
      limit: 10,
      search: 'Jane',
      stage: 'APPLIED',
      status: 'ACTIVE',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/applications', {
      params: {
        page: 1,
        limit: 10,
        search: 'Jane',
        stage: 'APPLIED',
        status: 'ACTIVE',
        recruiter: undefined,
        candidate: undefined,
        job: undefined,
        source: undefined,
        appliedDate: undefined,
        createdDate: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].applicationCode).toBe('APP-000001')
  })

  it('calls GET /applications/:id for single application', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockApp,
    } as any)

    const result = await applicationsService.getApplicationById('app_123')
    expect(apiClient.get).toHaveBeenCalledWith('/applications/app_123')
    expect(result.id).toBe('app_123')
  })

  it('calls POST /applications for application creation', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockApp,
    } as any)

    const input = {
      candidateId: 'cand_1',
      jobId: 'job_1',
      assignedRecruiterId: 'usr_rec',
      source: 'LINKEDIN' as const,
      remarks: 'Strong candidate referral.',
    }

    const result = await applicationsService.createApplication(input)
    expect(apiClient.post).toHaveBeenCalledWith('/applications', input)
    expect(result.applicationCode).toBe('APP-000001')
  })

  it('calls PATCH /applications/:id for remarks update', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, remarks: 'Updated note.' },
    } as any)

    const result = await applicationsService.updateApplication('app_123', {
      remarks: 'Updated note.',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app_123', {
      remarks: 'Updated note.',
    })
    expect(result.remarks).toBe('Updated note.')
  })

  it('calls PATCH /applications/:id/stage for stage update', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, stage: 'SCREENING' },
    } as any)

    const result = await applicationsService.updateStage('app_123', { stage: 'SCREENING' })
    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app_123/stage', {
      stage: 'SCREENING',
    })
    expect(result.stage).toBe('SCREENING')
  })

  it('calls PATCH /applications/:id/status for status update', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, status: 'HIRED' },
    } as any)

    const result = await applicationsService.updateStatus('app_123', { status: 'HIRED' })
    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app_123/status', {
      status: 'HIRED',
    })
    expect(result.status).toBe('HIRED')
  })

  it('calls PATCH /applications/:id/reject with reason code', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, status: 'REJECTED', rejectionReasonCode: 'SKILL_MISMATCH' },
    } as any)

    const result = await applicationsService.rejectApplication('app_123', {
      rejectionReasonCode: 'SKILL_MISMATCH',
      rejectionReasonNote: 'Lacks TypeScript experience.',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app_123/reject', {
      rejectionReasonCode: 'SKILL_MISMATCH',
      rejectionReasonNote: 'Lacks TypeScript experience.',
    })
    expect(result.status).toBe('REJECTED')
  })

  it('calls PATCH /applications/:id/withdraw with reason code', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, status: 'WITHDRAWN', withdrawalReasonCode: 'ACCEPTED_OTHER_OFFER' },
    } as any)

    const result = await applicationsService.withdrawApplication('app_123', {
      withdrawalReasonCode: 'ACCEPTED_OTHER_OFFER',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/applications/app_123/withdraw', {
      withdrawalReasonCode: 'ACCEPTED_OTHER_OFFER',
    })
    expect(result.status).toBe('WITHDRAWN')
  })

  it('calls DELETE /applications/:id for soft-delete', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
      data: { ...mockApp, deletedAt: '2026-03-01T00:00:00Z' },
    } as any)

    const result = await applicationsService.softDeleteApplication('app_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/applications/app_123')
    expect(result.deletedAt).toBe('2026-03-01T00:00:00Z')
  })
})
