import { useState } from 'react'
import { Button, Dialog, Textarea, Select } from '@/components/ui'
import {
  useUpdateStage,
  useUpdateStatus,
  useRejectApplication,
  useWithdrawApplication,
} from '../hooks'
import type { Application, ApplicationStage } from '../types/applications.types'
import { ArrowRight, CheckCircle, XCircle, UserX } from 'lucide-react'

export interface ApplicationActionsProps {
  readonly application: Application
}

const REJECTION_REASONS = [
  { value: 'SKILL_MISMATCH', label: 'Skill Mismatch' },
  { value: 'EXPERIENCE_GAP', label: 'Experience Gap' },
  { value: 'COMPENSATION_MISMATCH', label: 'Compensation Mismatch' },
  { value: 'FAILED_INTERVIEW', label: 'Failed Assessment/Interview' },
  { value: 'POSITION_CLOSED', label: 'Position Closed' },
  { value: 'OTHER', label: 'Other Reason' },
]

const WITHDRAWAL_REASONS = [
  { value: 'ACCEPTED_OTHER_OFFER', label: 'Accepted Other Offer' },
  { value: 'SALARY_EXPECTATIONS', label: 'Salary Expectations Not Met' },
  { value: 'LOCATION_COMMUTE', label: 'Location / Commute Constraints' },
  { value: 'PERSONAL_REASONS', label: 'Personal Reasons' },
  { value: 'OTHER', label: 'Other Reason' },
]

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const stageMutation = useUpdateStage()
  const statusMutation = useUpdateStatus()
  const rejectMutation = useRejectApplication()
  const withdrawMutation = useWithdrawApplication()

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectCode, setRejectCode] = useState('SKILL_MISMATCH')
  const [rejectNote, setRejectNote] = useState('')

  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawCode, setWithdrawCode] = useState('ACCEPTED_OTHER_OFFER')
  const [withdrawNote, setWithdrawNote] = useState('')

  const isPending =
    stageMutation.isPending ||
    statusMutation.isPending ||
    rejectMutation.isPending ||
    withdrawMutation.isPending

  const handleStageAdvance = (nextStage: ApplicationStage) => {
    void stageMutation.mutate({ id: application.id, stage: nextStage })
  }

  const handleHire = () => {
    void statusMutation.mutate({ id: application.id, status: 'HIRED' })
  }

  const handleRejectSubmit = async () => {
    if (!rejectCode) return
    await rejectMutation.mutateAsync({
      id: application.id,
      data: {
        rejectionReasonCode: rejectCode,
        rejectionReasonNote: rejectNote.trim() || undefined,
      },
    })
    setShowRejectModal(false)
    setRejectNote('')
  }

  const handleWithdrawSubmit = async () => {
    if (!withdrawCode) return
    await withdrawMutation.mutateAsync({
      id: application.id,
      data: {
        withdrawalReasonCode: withdrawCode,
        withdrawalReasonNote: withdrawNote.trim() || undefined,
      },
    })
    setShowWithdrawModal(false)
    setWithdrawNote('')
  }

  if (application.status !== 'ACTIVE') {
    return null
  }

  let nextStageAction: { label: string; stage?: ApplicationStage; isHire?: boolean } | null = null

  switch (application.stage) {
    case 'APPLIED':
      nextStageAction = { label: 'Move to Screening', stage: 'SCREENING' }
      break
    case 'SCREENING':
      nextStageAction = { label: 'Move to Shortlist', stage: 'SHORTLISTED' }
      break
    case 'SHORTLISTED':
      nextStageAction = { label: 'Advance to Interview', stage: 'INTERVIEW' }
      break
    case 'INTERVIEW':
      nextStageAction = { label: 'Extend Offer', stage: 'OFFER' }
      break
    case 'OFFER':
      nextStageAction = { label: 'Mark as Hired', isHire: true }
      break
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {nextStageAction && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (nextStageAction?.isHire) {
                handleHire()
              } else if (nextStageAction?.stage) {
                handleStageAdvance(nextStageAction.stage)
              }
            }}
            isLoading={stageMutation.isPending || statusMutation.isPending}
            disabled={isPending}
            iconRight={nextStageAction.isHire ? <CheckCircle size={15} /> : <ArrowRight size={15} />}
          >
            {nextStageAction.label}
          </Button>
        )}

        <Button
          variant="outline"
          size="md"
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
          iconLeft={<XCircle size={15} />}
          style={{ color: 'var(--color-error)' }}
        >
          Reject
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={() => setShowWithdrawModal(true)}
          disabled={isPending}
          iconLeft={<UserX size={15} />}
        >
          Withdraw
        </Button>
      </div>

      {/* Reject Modal Dialog */}
      <Dialog
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Application"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
            Select a rejection reason code and provide optional contextual notes.
          </p>

          <Select
            label="Rejection Reason"
            options={REJECTION_REASONS}
            value={rejectCode}
            onChange={(e) => setRejectCode(e.target.value)}
            required
          />

          <Textarea
            label="Internal Notes (Optional)"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            rows={3}
            placeholder="Additional context on why the candidate was rejected..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setShowRejectModal(false)} disabled={rejectMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRejectSubmit}
              isLoading={rejectMutation.isPending}
              disabled={rejectMutation.isPending || !rejectCode}
              style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)', color: '#fff' }}
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Withdraw Modal Dialog */}
      <Dialog
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Record Candidate Withdrawal"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body-sm)', margin: 0 }}>
            Record that the candidate has voluntarily withdrawn from this application.
          </p>

          <Select
            label="Withdrawal Reason"
            options={WITHDRAWAL_REASONS}
            value={withdrawCode}
            onChange={(e) => setWithdrawCode(e.target.value)}
            required
          />

          <Textarea
            label="Internal Notes (Optional)"
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            rows={3}
            placeholder="Candidate feedback or withdrawal notes..."
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)} disabled={withdrawMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleWithdrawSubmit}
              isLoading={withdrawMutation.isPending}
              disabled={withdrawMutation.isPending || !withdrawCode}
            >
              Confirm Withdrawal
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}
