import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { apiClient } from '@/services/api'
import type { Job } from '@/features/jobs/types/jobs.types'

describe('jobsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockJob: Job = {
    id: 'job_123',
    companyId: 'comp_1',
    departmentId: 'dept_eng',
    department: { id: 'dept_eng', name: 'Engineering' },
    jobCode: 'JOB-000001',
    title: 'Staff Frontend Engineer',
    description: 'Lead next-gen ATS architecture.',
    responsibilities: 'Build scalable UI modules.',
    requirements: 'React, TypeScript, GraphQL.',
    benefits: 'Comprehensive healthcare, remote stipend.',
    employmentType: 'FULL_TIME',
    workplaceType: 'REMOTE',
    openings: 2,
    status: 'DRAFT',
    isActive: true,
    createdBy: 'usr_admin',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  }

  it('calls GET /jobs with query parameters', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockJob],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    } as any)

    const result = await jobsService.listJobs({
      page: 1,
      limit: 10,
      search: 'Frontend',
      status: 'DRAFT',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/jobs', {
      params: {
        page: 1,
        limit: 10,
        search: 'Frontend',
        department: undefined,
        status: 'DRAFT',
        employmentType: undefined,
        workplaceType: undefined,
        recruiter: undefined,
        createdDate: undefined,
        closingDate: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].title).toBe('Staff Frontend Engineer')
  })

  it('calls GET /jobs/:id for single job', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockJob,
    } as any)

    const result = await jobsService.getJobById('job_123')
    expect(apiClient.get).toHaveBeenCalledWith('/jobs/job_123')
    expect(result.id).toBe('job_123')
  })

  it('calls POST /jobs for job creation', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockJob,
    } as any)

    const input = {
      title: 'Staff Frontend Engineer',
      departmentId: 'dept_eng',
      description: 'Lead next-gen ATS architecture.',
      employmentType: 'FULL_TIME' as const,
      workplaceType: 'REMOTE' as const,
      openings: 2,
    }

    const result = await jobsService.createJob(input)
    expect(apiClient.post).toHaveBeenCalledWith('/jobs', input)
    expect(result.jobCode).toBe('JOB-000001')
  })

  it('calls PATCH /jobs/:id for job update', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockJob, title: 'Principal Frontend Engineer' },
    } as any)

    const result = await jobsService.updateJob('job_123', {
      title: 'Principal Frontend Engineer',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123', {
      title: 'Principal Frontend Engineer',
    })
    expect(result.title).toBe('Principal Frontend Engineer')
  })

  it('calls lifecycle PATCH endpoints for status transitions', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValue({
      success: true,
      data: mockJob,
    } as any)

    await jobsService.publishJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/publish')

    await jobsService.openJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/open')

    await jobsService.pauseJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/pause')

    await jobsService.reopenJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/reopen')

    await jobsService.closeJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/close')

    await jobsService.archiveJob('job_123')
    expect(apiClient.patch).toHaveBeenCalledWith('/jobs/job_123/archive')
  })

  it('calls DELETE /jobs/:id for soft-delete', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
      data: { ...mockJob, deletedAt: '2026-03-01T00:00:00Z' },
    } as any)

    const result = await jobsService.softDeleteJob('job_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/jobs/job_123')
    expect(result.deletedAt).toBe('2026-03-01T00:00:00Z')
  })

  it('calls GET /departments/options to fetch department dropdown items', async () => {
    const mockDepts = [{ id: 'dept_eng', name: 'Engineering' }]
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockDepts,
    } as any)

    const result = await jobsService.getDepartmentOptions()
    expect(apiClient.get).toHaveBeenCalledWith('/departments/options')
    expect(result.length).toBe(1)
    expect(result[0].name).toBe('Engineering')
  })
})
