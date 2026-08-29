import { describe, it, expect, vi, beforeEach } from 'vitest'
import { offersService } from '@/features/offers/services/offers.service'
import { apiClient } from '@/services/api'
import type { Offer } from '@/features/offers/types/offers.types'

describe('offersService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockOffer: Offer = {
    id: 'off_123',
    offerCode: 'OFF-000001',
    companyId: 'comp_1',
    applicationId: 'app_1',
    candidateId: 'cand_1',
    recruiterId: 'usr_rec',
    version: 1,
    status: 'DRAFT',
    salary: 850000,
    currency: 'INR',
    employmentType: 'FULL_TIME',
    joiningDate: '2026-04-01T00:00:00.000Z',
    expiryDate: '2026-03-15T00:00:00.000Z',
    benefits: 'Health insurance, annual bonus',
    notes: 'Approved base salary exception',
    offerLetterUrl: 'https://storage.company.com/offers/OFF-000001.pdf',
    offerLetterFileName: 'Offer_Letter.pdf',
    approvedBy: null,
    approvedAt: null,
    sentAt: null,
    viewedAt: null,
    respondedAt: null,
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-20T10:00:00Z',
    application: {
      id: 'app_1',
      applicationCode: 'APP-000001',
      stage: 'OFFER',
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
        phone: '+1-555-0123',
      },
      job: {
        id: 'job_1',
        jobCode: 'JOB-000001',
        title: 'Senior Frontend Engineer',
      },
    },
    recruiter: {
      id: 'usr_rec',
      name: 'Alice Recruiter',
      email: 'alice@company.com',
    },
    approver: null,
  }

  it('calls GET /offers with query parameters and returns mapped list response', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockOffer],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    } as any)

    const result = await offersService.listOffers({
      page: 1,
      limit: 10,
      search: 'John',
      status: 'DRAFT',
      currency: 'INR',
      employmentType: 'FULL_TIME',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/offers', {
      params: {
        page: 1,
        limit: 10,
        search: 'John',
        status: 'DRAFT',
        currency: 'INR',
        employmentType: 'FULL_TIME',
        recruiterId: undefined,
        joiningDate: undefined,
        expiryDate: undefined,
        createdAt: undefined,
        sortBy: undefined,
        sortOrder: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].offerCode).toBe('OFF-000001')
    expect(result.meta?.total).toBe(1)
  })

  it('calls GET /offers/:id for single offer details', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockOffer,
    } as any)

    const result = await offersService.getOfferById('off_123')
    expect(apiClient.get).toHaveBeenCalledWith('/offers/off_123')
    expect(result.id).toBe('off_123')
    expect(result.salary).toBe(850000)
    expect(result.application?.candidate.firstName).toBe('John')
  })

  it('calls POST /offers for offer draft creation', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockOffer,
    } as any)

    const input = {
      applicationId: 'app_1',
      salary: 850000,
      currency: 'INR' as const,
      employmentType: 'FULL_TIME' as const,
      joiningDate: '2026-04-01T00:00:00.000Z',
      expiryDate: '2026-03-15T00:00:00.000Z',
      benefits: 'Health insurance',
    }

    const result = await offersService.createOffer(input)
    expect(apiClient.post).toHaveBeenCalledWith('/offers', input)
    expect(result.offerCode).toBe('OFF-000001')
  })

  it('calls PUT /offers/:id for updating draft offer', async () => {
    vi.spyOn(apiClient, 'put').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, salary: 900000 },
    } as any)

    const result = await offersService.updateDraft('off_123', {
      salary: 900000,
    })

    expect(apiClient.put).toHaveBeenCalledWith('/offers/off_123', {
      salary: 900000,
    })
    expect(result.salary).toBe(900000)
  })

  it('calls POST /offers/:id/submit for submitting offer', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'PENDING_APPROVAL' },
    } as any)

    const result = await offersService.submitForApproval('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/submit')
    expect(result.status).toBe('PENDING_APPROVAL')
  })

  it('calls POST /offers/:id/approve for approving offer', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'APPROVED', approvedAt: '2026-02-21T00:00:00Z' },
    } as any)

    const result = await offersService.approveOffer('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/approve')
    expect(result.status).toBe('APPROVED')
  })

  it('calls POST /offers/:id/send for sending offer to candidate', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'SENT', sentAt: '2026-02-21T10:00:00Z' },
    } as any)

    const result = await offersService.sendOffer('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/send')
    expect(result.status).toBe('SENT')
  })

  it('calls POST /offers/:id/view for marking offer as viewed', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'VIEWED', viewedAt: '2026-02-22T00:00:00Z' },
    } as any)

    const result = await offersService.markViewed('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/view')
    expect(result.status).toBe('VIEWED')
  })

  it('calls POST /offers/:id/accept for recording acceptance', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'ACCEPTED', respondedAt: '2026-02-23T00:00:00Z' },
    } as any)

    const result = await offersService.acceptOffer('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/accept')
    expect(result.status).toBe('ACCEPTED')
  })

  it('calls POST /offers/:id/decline for recording decline', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'DECLINED', respondedAt: '2026-02-23T00:00:00Z' },
    } as any)

    const result = await offersService.declineOffer('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/decline')
    expect(result.status).toBe('DECLINED')
  })

  it('calls POST /offers/:id/withdraw for withdrawing offer', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, status: 'WITHDRAWN' },
    } as any)

    const result = await offersService.withdrawOffer('off_123')
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/withdraw')
    expect(result.status).toBe('WITHDRAWN')
  })

  it('calls POST /offers/:id/revision for creating revision', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockOffer, id: 'off_124', version: 2, salary: 950000 },
    } as any)

    const input = {
      applicationId: 'app_1',
      salary: 950000,
      currency: 'INR' as const,
      employmentType: 'FULL_TIME' as const,
      joiningDate: '2026-04-01T00:00:00.000Z',
      expiryDate: '2026-03-15T00:00:00.000Z',
    }

    const result = await offersService.createRevision('off_123', input)
    expect(apiClient.post).toHaveBeenCalledWith('/offers/off_123/revision', input)
    expect(result.version).toBe(2)
  })

  it('calls DELETE /offers/:id for soft delete', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
    } as any)

    await offersService.softDeleteOffer('off_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/offers/off_123')
  })
})
