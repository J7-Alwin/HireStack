import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { PipelineStageBadge } from './PipelineStageBadge'
import { ArrowRight, History, ExternalLink, User, Briefcase } from 'lucide-react'
import type { Pipeline } from '../types/pipeline.types'

export interface PipelineApplicationCardProps {
  readonly pipeline: Pipeline
  readonly onMove?: (pipeline: Pipeline) => void
  readonly onViewHistory?: (pipeline: Pipeline) => void
}

export function PipelineApplicationCard({
  pipeline,
  onMove,
  onViewHistory,
}: PipelineApplicationCardProps) {
  const candidateName = pipeline.candidate
    ? `${pipeline.candidate.firstName} ${pipeline.candidate.lastName}`
    : 'Candidate'

  const jobTitle = pipeline.job?.title || 'Job Requisition'
  const isCompleted = pipeline.isCompleted

  return (
    <Card
      variant="elevated"
      padding="md"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Header: Candidate name & Code */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <Link
            to={`/app/applications/${pipeline.applicationId}`}
            style={{
              fontWeight: 600,
              fontSize: 'var(--text-body-md)',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{candidateName}</span>
            <ExternalLink size={12} style={{ color: 'var(--color-text-muted)' }} />
          </Link>
          {pipeline.candidate?.candidateCode && (
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              {pipeline.candidate.candidateCode}
            </span>
          )}
        </div>

        <PipelineStageBadge stage={pipeline.currentStage} size="sm" />
      </div>

      {/* Details: Job title & Recruiter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: 'var(--text-body-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)' }}>
          <Briefcase size={14} style={{ flexShrink: 0 }} />
          <Link
            to={`/app/jobs/${pipeline.jobId}`}
            style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {jobTitle}
          </Link>
        </div>

        {pipeline.recruiter && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: 'var(--text-caption)' }}>
            <User size={12} style={{ flexShrink: 0 }} />
            <span>
              {pipeline.recruiter.firstName || pipeline.recruiter.name || pipeline.recruiter.email}
            </span>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: 'var(--space-2)',
          marginTop: '2px',
        }}
      >
        {onViewHistory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewHistory(pipeline)}
            aria-label={`View history for ${candidateName}`}
            iconLeft={<History size={14} />}
          >
            History
          </Button>
        )}

        {!isCompleted && onMove ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove(pipeline)}
            aria-label={`Move stage for ${candidateName}`}
            iconRight={<ArrowRight size={14} />}
          >
            Move Stage
          </Button>
        ) : (
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {pipeline.completedReason || 'Completed'}
          </span>
        )}
      </div>
    </Card>
  )
}
