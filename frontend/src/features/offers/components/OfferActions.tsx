import { Card, Button } from '@/components/ui'
import { AtsConfirmDialog } from '@/components/ats'
import {
  useSubmitOffer,
  useApproveOffer,
  useSendOffer,
  useMarkOfferViewed,
  useAcceptOffer,
  useDeclineOffer,
  useWithdrawOffer,
  useDeleteOffer,
} from '../hooks'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { useState } from 'react'
import {
  Send,
  CheckCircle,
  Eye,
  CheckCheck,
  XCircle,
  Ban,
  GitBranch,
  Edit2,
  Trash2,
} from 'lucide-react'
import type { Offer } from '../types/offers.types'

export interface OfferActionsProps {
  readonly offer: Offer
  readonly onEdit?: () => void
  readonly onRevise?: () => void
}

export function OfferActions({ offer, onEdit, onRevise }: OfferActionsProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === Role.COMPANY_ADMIN

  const submitMutation = useSubmitOffer(offer.id)
  const approveMutation = useApproveOffer(offer.id)
  const sendMutation = useSendOffer(offer.id)
  const viewMutation = useMarkOfferViewed(offer.id)
  const acceptMutation = useAcceptOffer(offer.id)
  const declineMutation = useDeclineOffer(offer.id)
  const withdrawMutation = useWithdrawOffer(offer.id)
  const deleteMutation = useDeleteOffer()

  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const isPending =
    submitMutation.isPending ||
    approveMutation.isPending ||
    sendMutation.isPending ||
    viewMutation.isPending ||
    acceptMutation.isPending ||
    declineMutation.isPending ||
    withdrawMutation.isPending ||
    deleteMutation.isPending

  const handleActionConfirm = async () => {
    if (!confirmAction) return
    try {
      if (confirmAction === 'SUBMIT') await submitMutation.mutateAsync()
      if (confirmAction === 'APPROVE') await approveMutation.mutateAsync()
      if (confirmAction === 'SEND') await sendMutation.mutateAsync()
      if (confirmAction === 'VIEW') await viewMutation.mutateAsync()
      if (confirmAction === 'ACCEPT') await acceptMutation.mutateAsync()
      if (confirmAction === 'DECLINE') await declineMutation.mutateAsync()
      if (confirmAction === 'WITHDRAW') await withdrawMutation.mutateAsync()
      if (confirmAction === 'DELETE') await deleteMutation.mutateAsync(offer.id)
    } finally {
      setConfirmAction(null)
    }
  }

  const isTerminal =
    offer.status === 'ACCEPTED' ||
    offer.status === 'DECLINED' ||
    offer.status === 'EXPIRED' ||
    offer.status === 'WITHDRAWN'

  return (
    <Card variant="elevated" padding="lg">
      <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: '0 0 var(--space-4) 0' }}>
        Offer Actions & Lifecycle
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* DRAFT ACTIONS */}
        {offer.status === 'DRAFT' && (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => setConfirmAction('SUBMIT')}
              disabled={isPending}
              iconLeft={<Send size={16} />}
            >
              Submit for Approval
            </Button>

            {onEdit && (
              <Button
                variant="outline"
                size="md"
                onClick={onEdit}
                disabled={isPending}
                iconLeft={<Edit2 size={16} />}
              >
                Edit Draft Details
              </Button>
            )}

            {isAdmin && (
              <Button
                variant="danger"
                size="md"
                onClick={() => setConfirmAction('DELETE')}
                disabled={isPending}
                iconLeft={<Trash2 size={16} />}
              >
                Delete Draft Offer
              </Button>
            )}
          </>
        )}

        {/* PENDING APPROVAL ACTIONS */}
        {offer.status === 'PENDING_APPROVAL' && (
          <>
            {isAdmin ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => setConfirmAction('APPROVE')}
                disabled={isPending}
                iconLeft={<CheckCircle size={16} />}
              >
                Approve Offer
              </Button>
            ) : (
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>
                Waiting for Company Administrator approval.
              </div>
            )}
          </>
        )}

        {/* APPROVED ACTIONS */}
        {offer.status === 'APPROVED' && (
          <>
            {isAdmin ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setConfirmAction('SEND')}
                  disabled={isPending}
                  iconLeft={<Send size={16} />}
                >
                  Send Offer to Candidate
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setConfirmAction('WITHDRAW')}
                  disabled={isPending}
                  iconLeft={<Ban size={16} />}
                >
                  Withdraw Offer
                </Button>
              </>
            ) : (
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>
                Offer approved. Waiting for Company Admin to send to candidate.
              </div>
            )}
          </>
        )}

        {/* SENT ACTIONS */}
        {offer.status === 'SENT' && (
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setConfirmAction('VIEW')}
              disabled={isPending}
              iconLeft={<Eye size={16} />}
            >
              Mark Viewed by Candidate
            </Button>

            {isAdmin && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setConfirmAction('WITHDRAW')}
                disabled={isPending}
                iconLeft={<Ban size={16} />}
              >
                Withdraw Offer
              </Button>
            )}
          </>
        )}

        {/* VIEWED ACTIONS */}
        {offer.status === 'VIEWED' && (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={() => setConfirmAction('ACCEPT')}
              disabled={isPending}
              iconLeft={<CheckCheck size={16} />}
            >
              Candidate Accepted
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={() => setConfirmAction('DECLINE')}
              disabled={isPending}
              iconLeft={<XCircle size={16} />}
            >
              Candidate Declined
            </Button>

            {isAdmin && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setConfirmAction('WITHDRAW')}
                disabled={isPending}
                iconLeft={<Ban size={16} />}
              >
                Withdraw Offer
              </Button>
            )}
          </>
        )}

        {/* CREATE REVISION ACTION (Allowed for any non-accepted state) */}
        {offer.status !== 'ACCEPTED' && onRevise && (
          <Button
            variant="ghost"
            size="md"
            onClick={onRevise}
            disabled={isPending}
            iconLeft={<GitBranch size={16} />}
          >
            Create Offer Revision
          </Button>
        )}

        {/* TERMINAL STATUS NOTICE */}
        {isTerminal && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warm-white-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
            }}
          >
            This offer is in a terminal status ({offer.status.replace(/_/g, ' ')}) and is immutable.
          </div>
        )}
      </div>

      {/* CONFIRMATION MODALS */}
      <AtsConfirmDialog
        isOpen={confirmAction === 'SUBMIT'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Submit Offer for Approval"
        description="Submit this draft offer for Company Administrator review and approval?"
        confirmLabel="Submit for Approval"
        variant="primary"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'APPROVE'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Approve Offer"
        description="Approve this offer compensation and terms? The offer will be ready to send to candidate."
        confirmLabel="Approve Offer"
        variant="primary"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'SEND'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Send Offer to Candidate"
        description="Are you sure you want to send this offer to the candidate? Pipeline stage will advance to Offer Sent."
        confirmLabel="Send Offer"
        variant="primary"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'VIEW'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Mark Offer as Viewed"
        description="Register that the candidate has accessed and viewed this offer?"
        confirmLabel="Mark Viewed"
        variant="primary"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'ACCEPT'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Record Candidate Acceptance"
        description="Confirm candidate acceptance of this offer? This will transition the offer into an accepted immutable state."
        confirmLabel="Confirm Acceptance"
        variant="primary"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'DECLINE'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Record Candidate Decline"
        description="Confirm candidate decision to decline this offer?"
        confirmLabel="Confirm Decline"
        variant="danger"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'WITHDRAW'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Withdraw Offer"
        description="Are you sure you want to withdraw this offer? This will invalidate the offer and mark it as withdrawn."
        confirmLabel="Withdraw Offer"
        variant="danger"
      />

      <AtsConfirmDialog
        isOpen={confirmAction === 'DELETE'}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleActionConfirm}
        title="Delete Draft Offer"
        description="Are you sure you want to delete this draft offer record?"
        confirmLabel="Delete Offer"
        variant="danger"
      />
    </Card>
  )
}
