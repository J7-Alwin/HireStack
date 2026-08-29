import { Card } from '@/components/ui'
import type { Job } from '../types/jobs.types'
import { FileText, CheckCircle2, ListChecks, Gift } from 'lucide-react'

export interface JobDescriptionProps {
  readonly job: Job
}

export function JobDescription({ job }: JobDescriptionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* 1. Overview */}
      <Card variant="elevated" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
          <FileText size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Role Description
          </h3>
        </div>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--leading-relaxed)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {job.description}
        </p>
      </Card>

      {/* 2. Responsibilities */}
      {job.responsibilities && (
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <CheckCircle2 size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
              Key Responsibilities
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--leading-relaxed)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {job.responsibilities}
          </p>
        </Card>
      )}

      {/* 3. Requirements */}
      {job.requirements && (
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <ListChecks size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
              Requirements & Qualifications
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--leading-relaxed)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {job.requirements}
          </p>
        </Card>
      )}

      {/* 4. Benefits */}
      {job.benefits && (
        <Card variant="elevated" padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
            <Gift size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
              Perks & Benefits
            </h3>
          </div>
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--leading-relaxed)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {job.benefits}
          </p>
        </Card>
      )}
    </div>
  )
}
