import { describe, it, expect, vi, beforeEach } from 'vitest'
import { dashboardService } from '@/features/dashboard/services'
import { apiClient } from '@/services/api'
import { Role, AccountStatus } from '@/types'

describe('dashboardService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls GET /pipeline/dashboard/company for company pipeline metrics', async () => {
    const mockData = {
      success: true,
      message: 'Success',
      data: {
        activeCandidates: 12,
        hiredCount: 3,
        rejectedCount: 1,
        withdrawnCount: 0,
        interviewsToday: 2,
        offersPending: 1,
        offersAccepted: 2,
        stageBreakdown: { APPLIED: 5, SCREENING: 7 },
      },
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockData)

    const result = await dashboardService.getCompanyPipelineMetrics()
    expect(apiClient.get).toHaveBeenCalledWith('/pipeline/dashboard/company')
    expect(result.activeCandidates).toBe(12)
  })

  it('calls GET /pipeline/dashboard/recruiter for recruiter metrics', async () => {
    const mockData = {
      success: true,
      message: 'Success',
      data: {
        activeCandidates: 8,
        hiredCount: 2,
        rejectedCount: 0,
        withdrawnCount: 0,
        interviewsToday: 1,
        offersPending: 1,
        offersAccepted: 1,
        stageBreakdown: { SCREENING: 4, HR_INTERVIEW: 4 },
      },
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockData)

    const result = await dashboardService.getRecruiterPipelineMetrics()
    expect(apiClient.get).toHaveBeenCalledWith('/pipeline/dashboard/recruiter')
    expect(result.activeCandidates).toBe(8)
  })

  it('calls GET /companies for platform companies', async () => {
    const mockData = {
      success: true,
      message: 'Success',
      data: [{ id: 'comp_1', name: 'Acme Corp', status: AccountStatus.ACTIVE, isVerified: true, createdAt: '2026-01-01' }],
      pagination: { total: 1, totalPages: 1, page: 1, limit: 10 },
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockData)

    const result = await dashboardService.getCompanies({ page: 1, limit: 10 })
    expect(apiClient.get).toHaveBeenCalledWith('/companies', { params: { page: 1, limit: 10 } })
    expect(result.data.length).toBe(1)
  })

  it('calls GET /users for platform users', async () => {
    const mockData = {
      success: true,
      message: 'Success',
      data: [{ id: 'usr_1', email: 'admin@acme.com', role: Role.COMPANY_ADMIN, status: AccountStatus.ACTIVE, createdAt: '2026-01-01' }],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockData)

    const result = await dashboardService.getUsers({ page: 1, limit: 10 })
    expect(apiClient.get).toHaveBeenCalledWith('/users', { params: { page: 1, limit: 10 } })
    expect(result.data.length).toBe(1)
  })

  it('calls GET /users/me for current user', async () => {
    const mockData = {
      success: true,
      message: 'Success',
      data: { id: 'usr_cand', email: 'cand@gmail.com', role: Role.CANDIDATE, status: AccountStatus.ACTIVE, companyId: null },
    }
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce(mockData)

    const result = await dashboardService.getCurrentUser()
    expect(apiClient.get).toHaveBeenCalledWith('/users/me')
    expect(result.email).toBe('cand@gmail.com')
  })
})
