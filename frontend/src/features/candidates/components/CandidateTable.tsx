import { useState } from 'react'
import { DataTable, type ColumnDef, Button } from '@/components/ui'
import { AtsStatusBadge, AtsConfirmDialog } from '@/components/ats'
import { formatDate } from '@/features/dashboard/utils'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type { Candidate } from '../types/candidates.types'
import { Eye, Edit2, Trash2 } from 'lucide-react'

export interface CandidateTableProps {
  readonly candidates: readonly Candidate[]
  readonly isLoading?: boolean
  readonly onView: (candidate: Candidate) => void
  readonly onEdit: (candidate: Candidate) => void
  readonly onDelete?: (candidateId: string) => Promise<void> | void
}

export function CandidateTable({
  candidates,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: CandidateTableProps) {
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const [candidateToDelete, setCandidateToDelete] = useState<Candidate | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete || !onDelete) return
    try {
      setIsDeleting(true)
      await onDelete(candidateToDelete.id)
      setCandidateToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<Candidate>[] = [
    {
      id: 'name',
      header: 'Candidate',
      cell: (candidate: Candidate) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {candidate.firstName} {candidate.lastName}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {candidate.candidateCode}
            {candidate.currentDesignation ? ` • ${candidate.currentDesignation}` : ''}
          </span>
        </div>
      ),
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: (candidate: Candidate) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 'var(--text-body-sm)' }}>
          <span>{candidate.email || '—'}</span>
          {candidate.phone && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
              {candidate.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'company',
      header: 'Company / Exp',
      cell: (candidate: Candidate) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 'var(--text-body-sm)' }}>
          <span>{candidate.currentCompany || '—'}</span>
          {candidate.experienceYears !== null && candidate.experienceYears !== undefined && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              {candidate.experienceYears} yrs exp
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'recruiter',
      header: 'Recruiter',
      cell: (candidate: Candidate) => (
        <span style={{ fontSize: 'var(--text-body-sm)' }}>
          {candidate.primaryRecruiter?.name || candidate.primaryRecruiter?.email || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (candidate: Candidate) => (
        <AtsStatusBadge status={candidate.status} size="sm" />
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (candidate: Candidate) => (
        <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
          {formatDate(candidate.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (candidate: Candidate) => (
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
              onView(candidate)
            }}
            aria-label={`View ${candidate.firstName} ${candidate.lastName}`}
          >
            <Eye size={15} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(candidate)
            }}
            aria-label={`Edit ${candidate.firstName} ${candidate.lastName}`}
          >
            <Edit2 size={15} />
          </Button>

          {isCompanyAdmin && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setCandidateToDelete(candidate)
              }}
              aria-label={`Delete ${candidate.firstName} ${candidate.lastName}`}
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
        data={candidates}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        onRowClick={onView}
        emptyTitle="No candidates found"
        emptyDescription="Try adjusting your search criteria or add a new candidate."
      />

      {candidateToDelete && (
        <AtsConfirmDialog
          isOpen={true}
          onClose={() => setCandidateToDelete(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Candidate Profile"
          description={`Are you sure you want to remove ${candidateToDelete.firstName} ${candidateToDelete.lastName}? This will soft-delete the candidate profile.`}
          confirmLabel="Delete Candidate"
          variant="danger"
          isLoading={isDeleting}
        />
      )}
    </>
  )
}
