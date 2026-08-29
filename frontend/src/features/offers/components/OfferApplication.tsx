import { Link } from 'react-router-dom'
import { Card, Button, Badge } from '@/components/ui'
import { Layers, ExternalLink } from 'lucide-react'
import type { OfferApplicationInfo } from '../types/offers.types'

export interface OfferApplicationProps {
  readonly application?: OfferApplicationInfo | null
}

export function OfferApplication({ application }: OfferApplicationProps) {
  if (!application) {
    return (
      <Card variant="elevated" padding="md">
        <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: '0 0 8px 0' }}>
          Application Context
        </h4>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
          No application details available.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
          <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: 0 }}>
            Application Context
          </h4>
        </div>

        {application.id && (
          <Link to={`/app/applications/${application.id}`}>
            <Button variant="ghost" size="sm" iconRight={<ExternalLink size={12} />}>
              View Application
            </Button>
          </Link>
        )}
      </div>

      <div
        style={{
          marginTop: 'var(--space-3)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 'var(--space-3)',
          fontSize: 'var(--text-body-sm)',
        }}
      >
        <div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
            Application Code
          </span>
          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {application.applicationCode}
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
            Stage
          </span>
          <div>
            <Badge variant="neutral" size="sm">
              {application.stage.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
            Assigned Recruiter
          </span>
          <div style={{ color: 'var(--color-text-primary)' }}>
            {application.assignedRecruiter?.firstName ||
              application.assignedRecruiter?.name ||
              '—'}
          </div>
        </div>
      </div>
    </Card>
  )
}
