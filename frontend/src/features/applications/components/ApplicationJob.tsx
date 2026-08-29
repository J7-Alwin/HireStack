import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { AtsStatusBadge } from '@/components/ats'
import type { ApplicationJobSummary } from '../types/applications.types'
import { Briefcase, ExternalLink } from 'lucide-react'

export interface ApplicationJobProps {
  readonly job?: ApplicationJobSummary
}

export function ApplicationJob({ job }: ApplicationJobProps) {
  if (!job) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0, marginBottom: 'var(--space-3)' }}>
          Job Requisition
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
          Job details not available.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg-secondary, #f4f4f4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Briefcase size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
              {job.title}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Job Code: {job.jobCode}
            </span>
          </div>
        </div>

        <Link to={`/app/jobs/${job.id}`}>
          <Button variant="outline" size="sm" iconRight={<ExternalLink size={13} />}>
            View Job
          </Button>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>Status:</span>
        <AtsStatusBadge status={job.status} size="sm" />
      </div>
    </Card>
  )
}
