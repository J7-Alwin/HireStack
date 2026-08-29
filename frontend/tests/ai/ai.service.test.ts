import { describe, it, expect, vi, beforeEach } from 'vitest'
import { aiService } from '@/features/ai/services/ai.service'
import { apiClient } from '@/services/api'
import type {
  ATSScoreResponse,
  JobMatchingResponse,
  ResumeRecommendationResponse,
  InterviewAssistantResponse,
  AiInsightResponse,
} from '@/features/ai/types'

describe('aiService', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls GET /ai/health for AI health check', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: { status: 'healthy', model: 'llama3.2' },
    } as any)

    const result = await aiService.health()
    expect(apiClient.get).toHaveBeenCalledWith('/ai/health')
    expect(result.status).toBe('healthy')
    expect(result.model).toBe('llama3.2')
  })

  it('calls POST /ai/resume/parse with FormData and returns created candidate', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: {
        id: 'cand_1',
        candidateCode: 'CAN-001',
        firstName: 'Bruce',
        lastName: 'Wayne',
      },
    } as any)

    const file = new File(['%PDF-1.4 mock content'], 'resume.pdf', {
      type: 'application/pdf',
    })
    const result = await aiService.parseResume(file)

    expect(apiClient.post).toHaveBeenCalledWith(
      '/ai/resume/parse',
      expect.any(FormData)
    )
    expect(result.id).toBe('cand_1')
    expect(result.firstName).toBe('Bruce')
  })

  it('calls POST /ai/ats-score for ATS candidate scoring', async () => {
    const mockAtsScore: ATSScoreResponse = {
      overallScore: 88,
      skillScore: 90,
      experienceScore: 85,
      educationScore: 80,
      keywordScore: 92,
      certificationScore: 75,
      strengths: ['Expert in TypeScript', 'Strong architectural background'],
      weaknesses: ['Limited GraphQL exposure'],
      missingSkills: ['GraphQL'],
      recommendations: ['Evaluate system design skills in interview'],
      hiringRecommendation: 'RECOMMENDED',
      overallReason: 'Strong alignment with senior engineer profile',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockAtsScore,
    } as any)

    const result = await aiService.createAtsScore({
      candidateId: 'cand_1',
      jobId: 'job_1',
    })

    expect(apiClient.post).toHaveBeenCalledWith('/ai/ats-score', {
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(result.overallScore).toBe(88)
    expect(result.hiringRecommendation).toBe('RECOMMENDED')
  })

  it('calls POST /ai/job-matching for applicant ranking', async () => {
    const mockMatching: JobMatchingResponse = {
      jobId: 'job_1',
      totalCandidates: 2,
      generatedAt: '2026-03-01T12:00:00Z',
      matches: [
        {
          candidateId: 'c1',
          candidateName: 'Clark Kent',
          matchPercentage: 95,
          recommendation: 'STRONGLY_RECOMMENDED',
        },
      ],
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockMatching,
    } as any)

    const result = await aiService.createJobMatching({ jobId: 'job_1' })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/job-matching', {
      jobId: 'job_1',
    })
    expect(result.matches.length).toBe(1)
  })

  it('calls GET /ai/job-matching/:jobId and /ai/job-matching/:jobId/:candidateId', async () => {
    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [{ id: 'm1', jobId: 'job_1', candidateId: 'c1', matchPercentage: 90 }],
    } as any)

    const matches = await aiService.getJobMatches('job_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/job-matching/job_1')
    expect(matches.length).toBe(1)

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: { id: 'm1', jobId: 'job_1', candidateId: 'c1', matchPercentage: 90 },
    } as any)

    const detail = await aiService.getCandidateJobMatch('job_1', 'c1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/job-matching/job_1/c1')
    expect(detail.candidateId).toBe('c1')
  })

  it('calls POST and GET for resume recommendations', async () => {
    const mockRec: ResumeRecommendationResponse = {
      id: 'rec_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Good technical base',
      recommendations: [
        {
          category: 'SKILLS',
          priority: 'HIGH',
          currentIssue: 'Lack of metrics',
          recommendation: 'Add quantitative KPI results',
          reason: 'Show impact',
          evidence: 'Section experience',
          expectedImprovement: 'Higher interview callback rate',
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T12:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ success: true, data: mockRec } as any)
    const genResult = await aiService.createResumeRecommendations({ candidateId: 'cand_1' })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/resume-recommendations', {
      candidateId: 'cand_1',
    })
    expect(genResult.id).toBe('rec_1')

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockRec, mode: 'JOB_SPECIFIC', jobId: 'job_1' },
    } as any)
    const jobRecResult = await aiService.createJobResumeRecommendations({
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/resume-recommendations/job', {
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(jobRecResult.mode).toBe('JOB_SPECIFIC')

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockRec],
    } as any)
    const history = await aiService.getResumeRecommendationHistory('cand_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/resume-recommendations/history/cand_1')
    expect(history.length).toBe(1)

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ success: true, data: mockRec } as any)
    const singleRec = await aiService.getResumeRecommendation('rec_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/resume-recommendations/rec_1')
    expect(singleRec.id).toBe('rec_1')
  })

  it('calls POST and GET for interview assistant', async () => {
    const mockInterview: InterviewAssistantResponse = {
      id: 'int_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Focus on distributed systems',
      questions: [
        {
          category: 'TECHNICAL',
          question: 'How do you design a rate limiter?',
          reason: 'Evaluate backend scalability',
          difficulty: 'MEDIUM',
          followUps: ['How do you handle redis cluster outages?'],
        },
      ],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T12:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ success: true, data: mockInterview } as any)
    const genResult = await aiService.createInterviewAssistant({ candidateId: 'cand_1' })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/interview', { candidateId: 'cand_1' })
    expect(genResult.questions.length).toBe(1)

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { ...mockInterview, mode: 'JOB_SPECIFIC', jobId: 'job_1' },
    } as any)
    const jobResult = await aiService.createJobInterviewAssistant({
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/interview/job', {
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(jobResult.mode).toBe('JOB_SPECIFIC')

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: { candidateId: 'cand_1', totalGenerations: 1, history: [mockInterview] },
    } as any)
    const history = await aiService.getInterviewAssistantHistory('cand_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/interview/history/cand_1')
    expect(history.history.length).toBe(1)

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ success: true, data: mockInterview } as any)
    const detail = await aiService.getInterviewAssistant('int_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/interview/int_1')
    expect(detail.id).toBe('int_1')
  })

  it('calls POST and GET for AI insights', async () => {
    const mockInsight: AiInsightResponse = {
      id: 'ins_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      overallInsight: 'Strong engineering leadership track record',
      strengths: ['System design', 'Team mentoring'],
      weaknesses: ['Recent domain pivot'],
      skillGaps: [],
      experienceConcerns: [],
      hiringRisks: ['High salary expectation'],
      hiringConfidence: 85,
      jobFitObservations: ['Excellent fit for tech lead opening'],
      recruiterFocusAreas: ['Probe compensation expectations in screening'],
      recommendation: 'PROCEED_TO_INTERVIEW',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T12:00:00Z',
      updatedAt: '2026-03-01T12:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ success: true, data: mockInsight } as any)
    const genResult = await aiService.createAiInsights({ candidateId: 'cand_1', jobId: 'job_1' })
    expect(apiClient.post).toHaveBeenCalledWith('/ai/insights', {
      candidateId: 'cand_1',
      jobId: 'job_1',
    })
    expect(genResult.hiringConfidence).toBe(85)

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockInsight],
    } as any)
    const history = await aiService.getAiInsightHistory('cand_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/insights/history/cand_1')
    expect(history.length).toBe(1)

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ success: true, data: mockInsight } as any)
    const detail = await aiService.getAiInsight('ins_1')
    expect(apiClient.get).toHaveBeenCalledWith('/ai/insights/ins_1')
    expect(detail.id).toBe('ins_1')
  })
})
