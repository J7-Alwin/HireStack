import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { Briefcase, ExternalLink } from 'lucide-react'
import type { InterviewJob as JobType } from '../types/interviews.types'

export interface InterviewJobProps {
  readonly job?: JobType
}

export function InterviewJob({ job }: InterviewJobProps) {
  if (!job) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Job Requisition
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          No job details available.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="lg">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Briefcase size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Target Job Requisition
          </h3>
        </div>
        {job.id && (
          <Link to={`/app/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">
              <ExternalLink size={14} style={{ marginRight: '4px' }} />
              View Job
            </Button>
          </Link>
        )}
      </div>

      <div>
        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
          Job Title
        </span>
        <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
          {job.title}
        </span>
        {job.jobCode && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
            Requisition Code: {job.jobCode}
          </span>
        )}
      </div>
    </Card>
  )
}
