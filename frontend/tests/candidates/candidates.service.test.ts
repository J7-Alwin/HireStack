import { describe, it, expect, vi, beforeEach } from 'vitest'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { apiClient } from '@/services/api'
import type { Candidate } from '@/features/candidates/types/candidates.types'

describe('candidatesService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  const mockCandidate: Candidate = {
    id: 'cand_123',
    companyId: 'comp_1',
    candidateCode: 'CAND-000001',
    firstName: 'Jordan',
    lastName: 'Belfort',
    email: 'jordan@strattonevents.com',
    phone: '+1-555-0192',
    currentCompany: 'Stratton Oakmont',
    currentDesignation: 'Founder & CEO',
    experienceYears: 10,
    status: 'ACTIVE',
    isActive: true,
    primaryRecruiterId: 'usr_rec',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  }

  it('calls GET /candidates with query parameters', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockCandidate],
      meta: { total: 1, totalPages: 1, page: 1, limit: 10 },
    } as any)

    const result = await candidatesService.listCandidates({
      page: 1,
      limit: 10,
      search: 'Jordan',
      status: 'ACTIVE',
    })

    expect(apiClient.get).toHaveBeenCalledWith('/candidates', {
      params: {
        page: 1,
        limit: 10,
        search: 'Jordan',
        status: 'ACTIVE',
        employmentStatus: undefined,
        source: undefined,
        recruiter: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        showDeleted: undefined,
      },
    })
    expect(result.data.length).toBe(1)
    expect(result.data[0].firstName).toBe('Jordan')
  })

  it('calls GET /candidates/:id for single candidate', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockCandidate,
    } as any)

    const result = await candidatesService.getCandidateById('cand_123')
    expect(apiClient.get).toHaveBeenCalledWith('/candidates/cand_123')
    expect(result.id).toBe('cand_123')
  })

  it('calls POST /candidates for candidate creation', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockCandidate,
    } as any)

    const input = {
      firstName: 'Jordan',
      lastName: 'Belfort',
      email: 'jordan@strattonevents.com',
      primaryRecruiterId: 'usr_rec',
    }

    const result = await candidatesService.createCandidate(input)
    expect(apiClient.post).toHaveBeenCalledWith('/candidates', input)
    expect(result.candidateCode).toBe('CAND-000001')
  })

  it('calls PATCH /candidates/:id for candidate update', async () => {
    vi.spyOn(apiClient, 'patch').mockResolvedValueOnce({
      success: true,
      data: { ...mockCandidate, currentCompany: 'New Venture' },
    } as any)

    const result = await candidatesService.updateCandidate('cand_123', {
      currentCompany: 'New Venture',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/candidates/cand_123', {
      currentCompany: 'New Venture',
    })
    expect(result.currentCompany).toBe('New Venture')
  })

  it('calls DELETE /candidates/:id for soft-delete', async () => {
    vi.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
      data: { ...mockCandidate, deletedAt: '2026-03-01T00:00:00Z' },
    } as any)

    const result = await candidatesService.softDeleteCandidate('cand_123')
    expect(apiClient.delete).toHaveBeenCalledWith('/candidates/cand_123')
    expect(result.deletedAt).toBe('2026-03-01T00:00:00Z')
  })

  it('calls POST /candidates/:id/notes to add note', async () => {
    const mockNote = {
      id: 'note_1',
      candidateId: 'cand_123',
      authorId: 'usr_rec',
      content: 'Excellent communication skills during screening.',
      createdAt: '2026-02-02T10:00:00Z',
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockNote,
    } as any)

    const result = await candidatesService.addNote(
      'cand_123',
      'Excellent communication skills during screening.'
    )
    expect(apiClient.post).toHaveBeenCalledWith('/candidates/cand_123/notes', {
      content: 'Excellent communication skills during screening.',
    })
    expect(result.content).toBe('Excellent communication skills during screening.')
  })

  it('calls POST /candidates/:id/tags to add tag', async () => {
    const mockTag = {
      candidateId: 'cand_123',
      tagId: 'tag_react',
      tag: { id: 'tag_react', name: 'react' },
    }
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockTag,
    } as any)

    const result = await candidatesService.assignTag('cand_123', 'react')
    expect(apiClient.post).toHaveBeenCalledWith('/candidates/cand_123/tags', {
      name: 'react',
    })
    expect(result.tagId).toBe('tag_react')
  })
})
