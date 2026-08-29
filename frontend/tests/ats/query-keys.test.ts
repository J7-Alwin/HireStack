import { describe, it, expect } from 'vitest'
import { candidateKeys } from '@/features/candidates'
import { jobKeys } from '@/features/jobs'
import { applicationKeys } from '@/features/applications'
import { interviewKeys } from '@/features/interviews'
import { offerKeys } from '@/features/offers'
import { pipelineKeys } from '@/features/pipeline'

describe('ATS Query Key Factories', () => {
  it('generates consistent candidate query keys', () => {
    expect(candidateKeys.all).toEqual(['candidates'])
    expect(candidateKeys.lists()).toEqual(['candidates', 'list'])
    expect(candidateKeys.list({ status: 'ACTIVE' })).toEqual([
      'candidates',
      'list',
      { status: 'ACTIVE' },
    ])
    expect(candidateKeys.detail('c1')).toEqual(['candidates', 'detail', 'c1'])
    expect(candidateKeys.notes('c1')).toEqual(['candidates', 'detail', 'c1', 'notes'])
    expect(candidateKeys.tags('c1')).toEqual(['candidates', 'detail', 'c1', 'tags'])
    expect(candidateKeys.resume('c1')).toEqual(['candidates', 'detail', 'c1', 'resume'])
  })

  it('generates consistent job query keys', () => {
    expect(jobKeys.all).toEqual(['jobs'])
    expect(jobKeys.lists()).toEqual(['jobs', 'list'])
    expect(jobKeys.list({ status: 'OPEN' })).toEqual(['jobs', 'list', { status: 'OPEN' }])
    expect(jobKeys.detail('j1')).toEqual(['jobs', 'detail', 'j1'])
  })

  it('generates consistent application query keys', () => {
    expect(applicationKeys.all).toEqual(['applications'])
    expect(applicationKeys.lists()).toEqual(['applications', 'list'])
    expect(applicationKeys.list({ stage: 'SCREENING' })).toEqual([
      'applications',
      'list',
      { stage: 'SCREENING' },
    ])
    expect(applicationKeys.detail('a1')).toEqual(['applications', 'detail', 'a1'])
    expect(applicationKeys.timeline('a1')).toEqual([
      'applications',
      'detail',
      'a1',
      'timeline',
    ])
  })

  it('generates consistent interview query keys', () => {
    expect(interviewKeys.all).toEqual(['interviews'])
    expect(interviewKeys.lists()).toEqual(['interviews', 'list'])
    expect(interviewKeys.list({ status: 'SCHEDULED' })).toEqual([
      'interviews',
      'list',
      { status: 'SCHEDULED' },
    ])
    expect(interviewKeys.detail('i1')).toEqual(['interviews', 'detail', 'i1'])
    expect(interviewKeys.feedback('i1')).toEqual([
      'interviews',
      'detail',
      'i1',
      'feedback',
    ])
  })

  it('generates consistent offer query keys', () => {
    expect(offerKeys.all).toEqual(['offers'])
    expect(offerKeys.lists()).toEqual(['offers', 'list'])
    expect(offerKeys.list({ status: 'PENDING_APPROVAL' })).toEqual([
      'offers',
      'list',
      { status: 'PENDING_APPROVAL' },
    ])
    expect(offerKeys.detail('o1')).toEqual(['offers', 'detail', 'o1'])
  })

  it('generates consistent pipeline query keys', () => {
    expect(pipelineKeys.all).toEqual(['pipeline'])
    expect(pipelineKeys.dashboard()).toEqual(['pipeline', 'dashboard'])
    expect(pipelineKeys.company()).toEqual(['pipeline', 'dashboard', 'company'])
    expect(pipelineKeys.recruiter()).toEqual(['pipeline', 'dashboard', 'recruiter'])
    expect(pipelineKeys.stages()).toEqual(['pipeline', 'stages'])
    expect(pipelineKeys.job('j1')).toEqual(['pipeline', 'job', 'j1'])
    expect(pipelineKeys.transitions('a1')).toEqual(['pipeline', 'transitions', 'a1'])
  })
})
