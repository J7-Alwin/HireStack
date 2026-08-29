import { Card, Badge } from '@/components/ui'
import { formatDate } from '@/features/dashboard/utils'
import type { Candidate } from '../types/candidates.types'
import { Mail, Phone, MapPin, Briefcase, Calendar, UserCheck, ExternalLink } from 'lucide-react'

export interface CandidateSummaryProps {
  readonly candidate: Candidate
}

export function CandidateSummary({ candidate }: CandidateSummaryProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
      {/* Contact & Location */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Contact & Location
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Mail size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '80px' }}>Email</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {candidate.email || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '80px' }}>Phone</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {candidate.phone || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '80px' }}>Location</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {[candidate.city, candidate.state, candidate.country].filter(Boolean).join(', ') || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '80px' }}>Recruiter</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {candidate.primaryRecruiter?.name || candidate.primaryRecruiter?.email || '—'}
            </span>
          </div>
        </div>
      </Card>

      {/* Professional Details & Links */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Professional Background
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Current Role</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {candidate.currentDesignation || '—'} {candidate.currentCompany ? `@ ${candidate.currentCompany}` : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Experience</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {candidate.experienceYears !== null && candidate.experienceYears !== undefined
                ? `${candidate.experienceYears} years`
                : '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--color-text-secondary)', width: '100px', marginLeft: '26px' }}>Source</span>
            <Badge variant="neutral" size="sm">
              {candidate.source || 'Direct'}
            </Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--color-text-secondary)', width: '100px', marginLeft: '26px' }}>Registered</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {formatDate(candidate.createdAt)}
            </span>
          </div>

          {/* Social Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
            {candidate.linkedInUrl && (
              <a
                href={candidate.linkedInUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-caption)' }}
              >
                <span>LinkedIn</span>
                <ExternalLink size={12} />
              </a>
            )}
            {candidate.githubUrl && (
              <a
                href={candidate.githubUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-caption)' }}
              >
                <span>GitHub</span>
                <ExternalLink size={12} />
              </a>
            )}
            {candidate.portfolioUrl && (
              <a
                href={candidate.portfolioUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-accent)', textDecoration: 'none', fontSize: 'var(--text-caption)' }}
              >
                <span>Portfolio</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
