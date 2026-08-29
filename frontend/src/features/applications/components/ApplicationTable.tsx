import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable, type ColumnDef, Button } from '@/components/ui'
import { AtsStatusBadge, AtsConfirmDialog } from '@/components/ats'
import { formatDate } from '@/features/dashboard/utils'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type { Application } from '../types/applications.types'
import { Eye, Edit2, Trash2 } from 'lucide-react'

export interface ApplicationTableProps {
  readonly applications: readonly Application[]
  readonly isLoading?: boolean
  readonly onView: (app: Application) => void
  readonly onEdit: (app: Application) => void
  readonly onDelete?: (appId: string) => Promise<void> | void
}

export function ApplicationTable({
  applications,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: ApplicationTableProps) {
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const [appToDelete, setAppToDelete] = useState<Application | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!appToDelete || !onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(appToDelete.id)
      setAppToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Application>[] = [
    {
      id: 'candidate',
      header: 'Candidate',
      cell: (app: Application) => {
        const name = app.candidate
          ? `${app.candidate.firstName} ${app.candidate.lastName}`
          : 'Candidate'
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {app.candidate ? (
              <Link
                to={`/app/candidates/${app.candidate.id}`}
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
              {app.candidate?.email || '—'}
            </span>
          </div>
        )
      },
    },
    {
      id: 'job',
      header: 'Job Requisition',
      cell: (app: Application) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {app.job ? (
            <Link
              to={`/app/jobs/${app.job.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                fontWeight: 500,
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                fontSize: 'var(--text-body-sm)',
              }}
            >
              {app.job.title}
            </Link>
          ) : (
            <span style={{ fontSize: 'var(--text-body-sm)' }}>—</span>
          )}
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {app.job?.jobCode || app.applicationCode}
          </span>
        </div>
      ),
    },
    {
      id: 'stage',
      header: 'Pipeline Stage',
      cell: (app: Application) => (
        <AtsStatusBadge status={app.stage} size="sm" />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (app: Application) => (
        <AtsStatusBadge status={app.status} size="sm" />
      ),
    },
    {
      id: 'source',
      header: 'Source',
      cell: (app: Application) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {app.source ? app.source.replace('_', ' ') : '—'}
        </span>
      ),
    },
    {
      id: 'recruiter',
      header: 'Recruiter',
      cell: (app: Application) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {app.assignedRecruiter?.firstName ||
            app.assignedRecruiter?.name ||
            app.assignedRecruiter?.email ||
            '—'}
        </span>
      ),
    },
    {
      id: 'appliedAt',
      header: 'Applied Date',
      cell: (app: Application) => (
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          {formatDate(app.appliedAt || app.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (app: Application) => (
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
              onView(app)
            }}
            aria-label={`View application ${app.applicationCode}`}
          >
            <Eye size={15} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(app)
            }}
            aria-label={`Edit application ${app.applicationCode}`}
          >
            <Edit2 size={15} />
          </Button>

          {isCompanyAdmin && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setAppToDelete(app)
              }}
              aria-label={`Delete application ${app.applicationCode}`}
              style={{ color: 'var(--color-error)' }}
            >
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={applications}
        keyExtractor={(a) => a.id}
        isLoading={isLoading}
        onRowClick={onView}
        emptyTitle="No applications found"
        emptyDescription="Try adjusting your search criteria or create a new application."
      />

      {appToDelete && (
        <AtsConfirmDialog
          isOpen={true}
          onClose={() => setAppToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Application"
          description={`Are you sure you want to delete application ${appToDelete.applicationCode}? This will soft-delete the application.`}
          confirmLabel="Delete Application"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
