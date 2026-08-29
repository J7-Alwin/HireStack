import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  aiKeys,
  useAiHealth,
  useParseResume,
  useAtsScore,
  useJobMatches,
  useCandidateJobMatch,
  useGenerateJobMatching,
  useResumeRecommendationHistory,
  useResumeRecommendation,
  useCreateResumeRecommendations,
  useCreateJobResumeRecommendations,
  useInterviewAssistantHistory,
  useInterviewAssistant,
  useCreateInterviewAssistant,
  useCreateJobInterviewAssistant,
  useAiInsightHistory,
  useAiInsight,
  useCreateAiInsights,
} from '@/features/ai/hooks'
import { aiService } from '@/features/ai/services/ai.service'
import type { ReactNode } from 'react'

describe('AI Query & Mutation Hooks', () => {
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

  it('generates consistent AI query keys', () => {
    expect(aiKeys.all).toEqual(['ai'])
    expect(aiKeys.health()).toEqual(['ai', 'health'])
    expect(aiKeys.jobMatches('job_1')).toEqual(['ai', 'job-matching', 'job_1'])
    expect(aiKeys.jobMatchDetail('job_1', 'cand_1')).toEqual([
      'ai',
      'job-matching',
      'job_1',
      'cand_1',
    ])
    expect(aiKeys.resumeRecommendations()).toEqual(['ai', 'resume-recommendations'])
    expect(aiKeys.resumeRecommendationHistory('cand_1')).toEqual([
      'ai',
      'resume-recommendations',
      'history',
      'cand_1',
    ])
    expect(aiKeys.resumeRecommendationDetail('rec_1')).toEqual([
      'ai',
      'resume-recommendations',
      'detail',
      'rec_1',
    ])
    expect(aiKeys.interviewAssistants()).toEqual(['ai', 'interview-assistant'])
    expect(aiKeys.interviewAssistantHistory('cand_1')).toEqual([
      'ai',
      'interview-assistant',
      'history',
      'cand_1',
    ])
    expect(aiKeys.interviewAssistantDetail('int_1')).toEqual([
      'ai',
      'interview-assistant',
      'detail',
      'int_1',
    ])
    expect(aiKeys.insights()).toEqual(['ai', 'insights'])
    expect(aiKeys.insightHistory('cand_1')).toEqual(['ai', 'insights', 'history', 'cand_1'])
    expect(aiKeys.insightDetail('ins_1')).toEqual(['ai', 'insights', 'detail', 'ins_1'])
  })

  it('useAiHealth queries AI health status', async () => {
    vi.spyOn(aiService, 'health').mockResolvedValueOnce({
      status: 'healthy',
      model: 'llama3.2',
    })

    const { result } = renderHook(() => useAiHealth(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.status).toBe('healthy')
  })

  it('useParseResume executes resume upload and invalidates candidates', async () => {
    vi.spyOn(aiService, 'parseResume').mockResolvedValueOnce({
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Bruce',
      lastName: 'Wayne',
    } as any)
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useParseResume(), { wrapper })
    const file = new File(['%PDF-1.4 mock'], 'resume.pdf', { type: 'application/pdf' })

    const res = await result.current.mutateAsync(file)
    expect(res.id).toBe('cand_1')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['candidates'] })
  })

  it('useAtsScore calculates ATS match and invalidates relevant job match queries', async () => {
    vi.spyOn(aiService, 'createAtsScore').mockResolvedValueOnce({
      overallScore: 88,
      skillScore: 90,
      experienceScore: 85,
      educationScore: 80,
      keywordScore: 92,
      certificationScore: 75,
      strengths: [],
      weaknesses: [],
      missingSkills: [],
      recommendations: [],
      hiringRecommendation: 'RECOMMENDED',
      overallReason: 'Strong fit',
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useAtsScore(), { wrapper })
    await result.current.mutateAsync({ candidateId: 'cand_1', jobId: 'job_1' })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: aiKeys.jobMatches('job_1'),
    })
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: aiKeys.jobMatchDetail('job_1', 'cand_1'),
    })
  })

  it('useJobMatches and useCandidateJobMatch fetch data correctly', async () => {
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValueOnce([
      { id: 'm1', jobId: 'job_1', candidateId: 'cand_1', matchPercentage: 90, recommendation: 'RECOMMENDED', createdAt: '2026-03-01T00:00:00Z' },
    ])
    vi.spyOn(aiService, 'getCandidateJobMatch').mockResolvedValueOnce({
      id: 'm1',
      jobId: 'job_1',
      candidateId: 'cand_1',
      candidateName: 'Clark Kent',
      matchPercentage: 90,
      skillMatch: 90,
      experienceMatch: 90,
      educationMatch: 90,
      projectMatch: 90,
      keywordMatch: 90,
      strengths: [],
      missingSkills: [],
      overallReason: 'Great fit',
      recommendation: 'RECOMMENDED',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })

    const { result: listRes } = renderHook(() => useJobMatches('job_1'), { wrapper })
    await waitFor(() => expect(listRes.current.isSuccess).toBe(true))
    expect(listRes.current.data?.length).toBe(1)

    const { result: detailRes } = renderHook(() => useCandidateJobMatch('job_1', 'cand_1'), { wrapper })
    await waitFor(() => expect(detailRes.current.isSuccess).toBe(true))
    expect(detailRes.current.data?.matchPercentage).toBe(90)
  })

  it('useGenerateJobMatching triggers ranking and invalidates matches', async () => {
    vi.spyOn(aiService, 'createJobMatching').mockResolvedValueOnce({
      jobId: 'job_1',
      totalCandidates: 1,
      generatedAt: '2026-03-01T00:00:00Z',
      matches: [],
    })
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useGenerateJobMatching(), { wrapper })
    await result.current.mutateAsync({ jobId: 'job_1' })

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: aiKeys.jobMatches('job_1'),
    })
  })

  it('useResumeRecommendations hooks handle queries and mutations', async () => {
    vi.spyOn(aiService, 'createResumeRecommendations').mockResolvedValueOnce({
      id: 'rec_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Good base',
      recommendations: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    vi.spyOn(aiService, 'getResumeRecommendationHistory').mockResolvedValueOnce([
      { id: 'rec_1', candidateId: 'cand_1', jobId: null, mode: 'GENERAL', overallSummary: 'Good base', createdAt: '2026-03-01T00:00:00Z' },
    ])

    const { result: createRes } = renderHook(() => useCreateResumeRecommendations(), { wrapper })
    await createRes.current.mutateAsync({ candidateId: 'cand_1' })

    const { result: createJobRes } = renderHook(() => useCreateJobResumeRecommendations(), { wrapper })
    vi.spyOn(aiService, 'createJobResumeRecommendations').mockResolvedValueOnce({
      id: 'rec_2',
      candidateId: 'cand_1',
      jobId: 'job_1',
      mode: 'JOB_SPECIFIC',
      overallSummary: 'Good base',
      recommendations: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    await createJobRes.current.mutateAsync({ candidateId: 'cand_1', jobId: 'job_1' })

    const { result: histRes } = renderHook(() => useResumeRecommendationHistory('cand_1'), { wrapper })
    await waitFor(() => expect(histRes.current.isSuccess).toBe(true))
    expect(histRes.current.data?.length).toBe(1)

    const { result: singleRes } = renderHook(() => useResumeRecommendation('rec_1'), { wrapper })
    vi.spyOn(aiService, 'getResumeRecommendation').mockResolvedValueOnce({
      id: 'rec_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Good base',
      recommendations: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    await waitFor(() => expect(singleRes.current.isSuccess).toBe(true))
  })

  it('useInterviewAssistant hooks handle queries and mutations', async () => {
    vi.spyOn(aiService, 'createInterviewAssistant').mockResolvedValueOnce({
      id: 'int_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Focused questions',
      questions: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValueOnce({
      candidateId: 'cand_1',
      totalGenerations: 1,
      history: [],
    })

    const { result: createRes } = renderHook(() => useCreateInterviewAssistant(), { wrapper })
    await createRes.current.mutateAsync({ candidateId: 'cand_1' })

    const { result: createJobRes } = renderHook(() => useCreateJobInterviewAssistant(), { wrapper })
    vi.spyOn(aiService, 'createJobInterviewAssistant').mockResolvedValueOnce({
      id: 'int_2',
      candidateId: 'cand_1',
      jobId: 'job_1',
      mode: 'JOB_SPECIFIC',
      overallSummary: 'Focused questions',
      questions: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    await createJobRes.current.mutateAsync({ candidateId: 'cand_1', jobId: 'job_1' })

    const { result: histRes } = renderHook(() => useInterviewAssistantHistory('cand_1'), { wrapper })
    await waitFor(() => expect(histRes.current.isSuccess).toBe(true))
    expect(histRes.current.data?.totalGenerations).toBe(1)

    const { result: singleRes } = renderHook(() => useInterviewAssistant('int_1'), { wrapper })
    vi.spyOn(aiService, 'getInterviewAssistant').mockResolvedValueOnce({
      id: 'int_1',
      candidateId: 'cand_1',
      jobId: null,
      mode: 'GENERAL',
      overallSummary: 'Focused questions',
      questions: [],
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    await waitFor(() => expect(singleRes.current.isSuccess).toBe(true))
  })

  it('useAiInsights hooks handle queries and mutations', async () => {
    vi.spyOn(aiService, 'createAiInsights').mockResolvedValueOnce({
      id: 'ins_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      overallInsight: 'Strong engineering leadership',
      strengths: ['Design'],
      weaknesses: [],
      skillGaps: [],
      experienceConcerns: [],
      hiringRisks: [],
      hiringConfidence: 90,
      jobFitObservations: [],
      recruiterFocusAreas: [],
      recommendation: 'HIRE',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValueOnce([
      { id: 'ins_1', candidateId: 'cand_1', jobId: 'job_1', overallInsight: 'Strong', hiringConfidence: 90, recommendation: 'HIRE', aiModel: 'llama3.2', promptVersion: '1.0.0', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z' },
    ])

    const { result: createRes } = renderHook(() => useCreateAiInsights(), { wrapper })
    await createRes.current.mutateAsync({ candidateId: 'cand_1', jobId: 'job_1' })

    const { result: histRes } = renderHook(() => useAiInsightHistory('cand_1'), { wrapper })
    await waitFor(() => expect(histRes.current.isSuccess).toBe(true))
    expect(histRes.current.data?.length).toBe(1)

    const { result: singleRes } = renderHook(() => useAiInsight('ins_1'), { wrapper })
    vi.spyOn(aiService, 'getAiInsight').mockResolvedValueOnce({
      id: 'ins_1',
      candidateId: 'cand_1',
      jobId: 'job_1',
      overallInsight: 'Strong engineering leadership',
      strengths: ['Design'],
      weaknesses: [],
      skillGaps: [],
      experienceConcerns: [],
      hiringRisks: [],
      hiringConfidence: 90,
      jobFitObservations: [],
      recruiterFocusAreas: [],
      recommendation: 'HIRE',
      aiModel: 'llama3.2',
      promptVersion: '1.0.0',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    })
    await waitFor(() => expect(singleRes.current.isSuccess).toBe(true))
  })
})
