import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import type { ApplicationCandidateSummary } from '../types/applications.types'
import { User, Mail, Phone, ExternalLink } from 'lucide-react'

export interface ApplicationCandidateProps {
  readonly candidate?: ApplicationCandidateSummary
}

export function ApplicationCandidate({ candidate }: ApplicationCandidateProps) {
  if (!candidate) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0, marginBottom: 'var(--space-3)' }}>
          Candidate Information
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
          Candidate details not available.
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
            <User size={20} style={{ color: 'var(--color-text-secondary)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
              {candidate.firstName} {candidate.lastName}
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Candidate Code: {candidate.candidateCode}
            </span>
          </div>
        </div>

        <Link to={`/app/candidates/${candidate.id}`}>
          <Button variant="outline" size="sm" iconRight={<ExternalLink size={13} />}>
            View Profile
          </Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-body-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={15} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ color: 'var(--color-text-secondary)' }}>{candidate.email}</span>
        </div>

        {candidate.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={15} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>{candidate.phone}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
