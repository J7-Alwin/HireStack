import { useState } from 'react'
import { DataTable, type ColumnDef, Button } from '@/components/ui'
import { AtsConfirmDialog } from '@/components/ats'
import { OfferStatusBadge } from './OfferStatusBadge'
import { formatSalary, formatOfferDate } from '../utils/offer-helpers'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Eye, Edit2, Trash2 } from 'lucide-react'
import type { Offer } from '../types/offers.types'

export interface OfferTableProps {
  readonly offers: readonly Offer[]
  readonly isLoading?: boolean
  readonly onView?: (offer: Offer) => void
  readonly onEdit?: (offer: Offer) => void
  readonly onDelete?: (offerId: string) => Promise<void> | void
}

export function OfferTable({
  offers,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: OfferTableProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === Role.COMPANY_ADMIN

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirmDelete = async () => {
    if (!deleteTargetId || !onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(deleteTargetId)
      setDeleteTargetId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Offer>[] = [
    {
      id: 'offerCode',
      header: 'Offer Code',
      cell: (item: Offer) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {item.offerCode}
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Version {item.version}
          </span>
        </div>
      ),
    },
    {
      id: 'candidate',
      header: 'Candidate',
      cell: (item: Offer) => {
        const cand = item.application?.candidate
        if (!cand) return <span>—</span>
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {cand.firstName} {cand.lastName}
            </span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {cand.email || '—'}
            </span>
          </div>
        )
      },
    },
    {
      id: 'job',
      header: 'Job Requisition',
      cell: (item: Offer) => {
        const job = item.application?.job
        if (!job) return <span>—</span>
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>
              {job.title}
            </span>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
              {job.jobCode ? `Req: ${job.jobCode}` : ''}
            </span>
          </div>
        )
      },
    },
    {
      id: 'salary',
      header: 'Compensation',
      cell: (item: Offer) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {formatSalary(item.salary, item.currency)}
          </span>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            {item.employmentType.replace(/_/g, ' ')}
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: Offer) => <OfferStatusBadge status={item.status} />,
    },
    {
      id: 'joiningDate',
      header: 'Joining Date',
      cell: (item: Offer) => (
        <span style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)' }}>
          {formatOfferDate(item.joiningDate)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (item: Offer) => {
        const isDraft = item.status === 'DRAFT'
        const canDelete = isAdmin && item.status !== 'ACCEPTED'

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(item)}
                aria-label={`View offer ${item.offerCode}`}
                iconLeft={<Eye size={14} />}
              >
                View
              </Button>
            )}

            {isDraft && onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                aria-label={`Edit offer ${item.offerCode}`}
                iconLeft={<Edit2 size={14} />}
              >
                Edit
              </Button>
            )}

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteTargetId(item.id)}
                aria-label={`Delete offer ${item.offerCode}`}
                style={{ color: 'var(--color-error)' }}
                iconLeft={<Trash2 size={14} />}
              />
            )}
          </div>
        )
      },
    },
  ]

  return (
    <>
      <DataTable<Offer>
        columns={columns}
        data={offers}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyTitle="No offers found"
        emptyDescription="Try adjusting your search filters or create a new offer draft."
        onRowClick={onView}
      />

      <AtsConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Offer"
        description="Are you sure you want to delete this offer? This will soft-delete the offer record."
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete Offer'}
        variant="danger"
      />
    </>
  )
}
