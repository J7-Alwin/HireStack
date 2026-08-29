import { useState } from 'react'
import { DataTable, type ColumnDef, Button } from '@/components/ui'
import { AtsStatusBadge, AtsConfirmDialog } from '@/components/ats'
import { formatDate } from '@/features/dashboard/utils'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type { Job } from '../types/jobs.types'
import { Eye, Edit2, Trash2 } from 'lucide-react'

export interface JobTableProps {
  readonly jobs: readonly Job[]
  readonly isLoading?: boolean
  readonly onView: (job: Job) => void
  readonly onEdit: (job: Job) => void
  readonly onDelete?: (jobId: string) => Promise<void> | void
}

export function JobTable({
  jobs,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: JobTableProps) {
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!jobToDelete || !onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(jobToDelete.id)
      setJobToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Job>[] = [
    {
      id: 'title',
      header: 'Job Title',
      cell: (job: Job) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {job.title}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {job.jobCode}
          </span>
        </div>
      ),
    },
    {
      id: 'department',
      header: 'Department',
      cell: (job: Job) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {job.department?.name || '—'}
        </span>
      ),
    },
    {
      id: 'workplace',
      header: 'Location / Workplace',
      cell: (job: Job) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 'var(--text-body-sm)' }}>
          <span>{job.location || 'Remote'}</span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {job.workplaceType ? job.workplaceType.replace('_', ' ') : '—'}
          </span>
        </div>
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: (job: Job) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {job.employmentType ? job.employmentType.replace('_', ' ') : '—'}
        </span>
      ),
    },
    {
      id: 'openings',
      header: 'Openings',
      cell: (job: Job) => (
        <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
          {job.openings}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (job: Job) => (
        <AtsStatusBadge status={job.status} size="sm" />
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (job: Job) => (
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          {formatDate(job.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (job: Job) => (
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
              onView(job)
            }}
            aria-label={`View ${job.title}`}
          >
            <Eye size={15} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(job)
            }}
            aria-label={`Edit ${job.title}`}
          >
            <Edit2 size={15} />
          </Button>

          {isCompanyAdmin && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setJobToDelete(job)
              }}
              aria-label={`Delete ${job.title}`}
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
        data={jobs}
        keyExtractor={(j) => j.id}
        isLoading={isLoading}
        onRowClick={onView}
        emptyTitle="No jobs found"
        emptyDescription="Try adjusting your filters or create a new job requisition."
      />

      {jobToDelete && (
        <AtsConfirmDialog
          isOpen={true}
          onClose={() => setJobToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Requisition"
          description={`Are you sure you want to delete ${jobToDelete.title}? This will soft-delete the job.`}
          confirmLabel="Delete Job"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
