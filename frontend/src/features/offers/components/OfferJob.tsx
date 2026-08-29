import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { Briefcase, ExternalLink } from 'lucide-react'
import type { OfferJobInfo } from '../types/offers.types'

export interface OfferJobProps {
  readonly job?: OfferJobInfo | null
}

export function OfferJob({ job }: OfferJobProps) {
  if (!job) {
    return (
      <Card variant="elevated" padding="md">
        <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: '0 0 8px 0' }}>
          Job Requisition
        </h4>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
          No job requisition details available.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
          <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: 0 }}>
            Job Requisition
          </h4>
        </div>

        {job.id && (
          <Link to={`/app/jobs/${job.id}`}>
            <Button variant="ghost" size="sm" iconRight={<ExternalLink size={12} />}>
              View Job
            </Button>
          </Link>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {job.title}
        </div>

        {job.jobCode && (
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Requisition Code: {job.jobCode}
          </div>
        )}
      </div>
    </Card>
  )
}
