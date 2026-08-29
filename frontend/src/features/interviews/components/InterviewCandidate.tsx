import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { User, Mail, Phone, ExternalLink } from 'lucide-react'
import type { InterviewCandidate as CandidateType } from '../types/interviews.types'

export interface InterviewCandidateProps {
  readonly candidate?: CandidateType
}

export function InterviewCandidate({ candidate }: InterviewCandidateProps) {
  if (!candidate) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Candidate
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          No candidate details available.
        </p>
      </Card>
    )
  }

  const fullName = `${candidate.firstName} ${candidate.lastName}`

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
          <User size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Candidate Profile
          </h3>
        </div>
        {candidate.id && (
          <Link to={`/app/candidates/${candidate.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">
              <ExternalLink size={14} style={{ marginRight: '4px' }} />
              View Candidate
            </Button>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
            Full Name
          </span>
          <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
            {fullName}
          </span>
          {candidate.candidateCode && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
              {candidate.candidateCode}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Mail size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <span style={{ fontSize: 'var(--text-body-sm)' }}>{candidate.email}</span>
        </div>

        {candidate.phone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Phone size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: 'var(--text-body-sm)' }}>{candidate.phone}</span>
          </div>
        )}
      </div>
    </Card>
  )
}
