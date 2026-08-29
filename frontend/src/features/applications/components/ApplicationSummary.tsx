import { Card } from '@/components/ui'
import { formatDate } from '@/features/dashboard/utils'
import type { Application } from '../types/applications.types'
import { Calendar, UserCheck, Tag, FileText, AlertCircle } from 'lucide-react'

export interface ApplicationSummaryProps {
  readonly application: Application
}

export function ApplicationSummary({ application }: ApplicationSummaryProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Source & Assigned Recruiter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tag size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '90px' }}>Source</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {application.source ? application.source.replace('_', ' ') : 'Direct Application'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '90px' }}>Recruiter</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {application.assignedRecruiter?.firstName ||
                application.assignedRecruiter?.name ||
                application.assignedRecruiter?.email ||
                'Unassigned'}
            </span>
          </div>
        </div>

        {/* Applied & Updated Dates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '90px' }}>Applied</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {formatDate(application.appliedAt || application.createdAt)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '90px' }}>Updated</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {formatDate(application.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {application.remarks && (
        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border-subtle, #eee)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FileText size={15} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>Remarks & Notes</span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>
            {application.remarks}
          </p>
        </div>
      )}

      {/* Rejection / Withdrawal Reason */}
      {(application.rejectionReasonCode || application.withdrawalReasonCode) && (
        <div
          style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-subtle, #f9f9f9)',
            borderRadius: '6px',
            border: '1px solid var(--color-border-subtle, #eee)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <AlertCircle size={15} style={{ color: 'var(--color-error)' }} />
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
              {application.status === 'REJECTED' ? 'Rejection Details' : 'Withdrawal Details'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <strong>Reason Code:</strong> {application.rejectionReasonCode || application.withdrawalReasonCode}
          </p>
          {(application.rejectionReasonNote || application.withdrawalReasonNote) && (
            <p style={{ margin: '4px 0 0', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
              <strong>Note:</strong> {application.rejectionReasonNote || application.withdrawalReasonNote}
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
