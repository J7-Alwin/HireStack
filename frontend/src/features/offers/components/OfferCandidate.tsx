import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { User, Mail, Phone, ExternalLink } from 'lucide-react'
import type { OfferCandidateInfo } from '../types/offers.types'

export interface OfferCandidateProps {
  readonly candidate?: OfferCandidateInfo | null
}

export function OfferCandidate({ candidate }: OfferCandidateProps) {
  if (!candidate) {
    return (
      <Card variant="elevated" padding="md">
        <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: '0 0 8px 0' }}>
          Candidate
        </h4>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
          No candidate details available.
        </p>
      </Card>
    )
  }

  return (
    <Card variant="elevated" padding="md">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
          <h4 style={{ fontSize: 'var(--text-body-md)', fontWeight: 600, margin: 0 }}>
            Candidate
          </h4>
        </div>

        {candidate.id && (
          <Link to={`/app/candidates/${candidate.id}`}>
            <Button variant="ghost" size="sm" iconRight={<ExternalLink size={12} />}>
              View Candidate
            </Button>
          </Link>
        )}
      </div>

      <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {candidate.firstName} {candidate.lastName}
        </div>

        {candidate.candidateCode && (
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Candidate ID: {candidate.candidateCode}
          </div>
        )}

        {candidate.email && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <Mail size={14} />
            <span>{candidate.email}</span>
          </div>
        )}

        {candidate.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <Phone size={14} />
            <span>{candidate.phone}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
