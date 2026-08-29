import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type ColumnDef, Button, Badge } from '@/components/ui'
import { AtsStatusBadge, AtsConfirmDialog } from '@/components/ats'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type { Interview } from '../types/interviews.types'
import {
  formatInterviewDate,
  formatInterviewRange,
  getRoundLabel,
  getModeLabel,
  getOutcomeLabel,
  getOutcomeVariant,
} from '../utils/interview-helpers'
import { Eye, Edit2, Trash2 } from 'lucide-react'

export interface InterviewTableProps {
  readonly interviews: readonly Interview[]
  readonly isLoading?: boolean
  readonly onView: (interview: Interview) => void
  readonly onEdit: (interview: Interview) => void
  readonly onDelete?: (interviewId: string) => Promise<void> | void
}

export function InterviewTable({
  interviews,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: InterviewTableProps) {
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const [interviewToDelete, setInterviewToDelete] = useState<Interview | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!interviewToDelete || !onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(interviewToDelete.id)
      setInterviewToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Interview>[] = [
    {
      id: 'interviewCode',
      header: 'Interview Code',
      cell: (item: Interview) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary-text, #111)' }}>
            {item.interviewCode}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {getRoundLabel(item.round)}
          </span>
        </div>
      ),
    },
    {
      id: 'candidate',
      header: 'Candidate',
      cell: (item: Interview) => {
        const cand = item.application?.candidate
        const name = cand ? `${cand.firstName} ${cand.lastName}` : '—'
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cand?.id ? (
              <Link
                to={`/app/candidates/${cand.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontWeight: 600,
                  color: 'var(--color-primary-text, #111)',
                  textDecoration: 'none',
                }}
              >
                {name}
              </Link>
            ) : (
              <span style={{ fontWeight: 600 }}>{name}</span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {cand?.email || '—'}
            </span>
          </div>
        )
      },
    },
    {
      id: 'job',
      header: 'Job Requisition',
      cell: (item: Interview) => {
        const job = item.application?.job
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {job?.id ? (
              <Link
                to={`/app/jobs/${job.id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontWeight: 500,
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-body-sm)',
                }}
              >
                {job.title}
              </Link>
            ) : (
              <span style={{ fontSize: 'var(--text-body-sm)' }}>—</span>
            )}
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {job?.jobCode || item.application?.applicationCode || '—'}
            </span>
          </div>
        )
      },
    },
    {
      id: 'schedule',
      header: 'Scheduled Date & Time',
      cell: (item: Interview) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
            {formatInterviewDate(item.scheduledDate, item.timeZone)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
            {formatInterviewRange(item.startTime, item.endTime, item.timeZone)}
          </span>
        </div>
      ),
    },
    {
      id: 'mode',
      header: 'Mode',
      cell: (item: Interview) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {getModeLabel(item.mode)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status & Outcome',
      cell: (item: Interview) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          <AtsStatusBadge status={item.status} size="sm" />
          {item.outcome && (
            <Badge variant={getOutcomeVariant(item.outcome)} size="sm">
              {getOutcomeLabel(item.outcome)}
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (item: Interview) => {
        const canEdit = item.status !== 'COMPLETED' && item.status !== 'CANCELLED' && item.status !== 'NO_SHOW'
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '6px',
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onView(item)
              }}
              aria-label={`View interview ${item.interviewCode}`}
            >
              <Eye size={15} />
            </Button>

            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(item)
                }}
                aria-label={`Edit interview ${item.interviewCode}`}
              >
                <Edit2 size={15} />
              </Button>
            )}

            {isCompanyAdmin && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setInterviewToDelete(item)
                }}
                aria-label={`Delete interview ${item.interviewCode}`}
                style={{ color: 'var(--color-error)' }}
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={interviews}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        onRowClick={onView}
        emptyTitle="No interviews found"
        emptyDescription="Try adjusting your search filters or schedule a new interview."
      />

      {interviewToDelete && (
        <AtsConfirmDialog
          isOpen={true}
          onClose={() => setInterviewToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Interview"
          description={`Are you sure you want to delete interview ${interviewToDelete.interviewCode}? This action will soft-delete the interview.`}
          confirmLabel="Delete Interview"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
