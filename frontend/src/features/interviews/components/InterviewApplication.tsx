import { Link } from 'react-router-dom'
import { Card, Button } from '@/components/ui'
import { AtsStatusBadge } from '@/components/ats'
import { FileText, ExternalLink, UserCheck } from 'lucide-react'
import type { InterviewApplication as ApplicationType } from '../types/interviews.types'

export interface InterviewApplicationProps {
  readonly application?: ApplicationType
}

export function InterviewApplication({ application }: InterviewApplicationProps) {
  if (!application) {
    return (
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Application
        </h3>
        <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          No application details available.
        </p>
      </Card>
    )
  }

  const recruiterName =
    application.assignedRecruiter?.firstName ||
    application.assignedRecruiter?.name ||
    application.assignedRecruiter?.email ||
    'Unassigned'

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
          <FileText size={20} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Application Context
          </h3>
        </div>
        {application.id && (
          <Link to={`/app/applications/${application.id}`} style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm">
              <ExternalLink size={14} style={{ marginRight: '4px' }} />
              View Application
            </Button>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Application Code
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
              {application.applicationCode}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <AtsStatusBadge status={application.stage} size="sm" />
            <AtsStatusBadge status={application.status} size="sm" />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <UserCheck size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Assigned Recruiter
            </span>
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
              {recruiterName}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
