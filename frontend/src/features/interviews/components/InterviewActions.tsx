import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Dialog, Select, Input, Textarea, Alert } from '@/components/ui'
import { AtsConfirmDialog } from '@/components/ats'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type {
  Interview,
  InterviewStatus,
  InterviewOutcome,
} from '../types/interviews.types'
import {
  useUpdateInterviewStatus,
  useRescheduleInterview,
  useRecordInterviewOutcome,
  useCancelInterview,
  useAssignInterviewers,
  useDeleteInterview,
} from '../hooks'
import {
  getAllowedStatusTransitions,
  getStatusLabel,
  isTerminalStatus,
} from '../utils/interview-helpers'
import {
  CheckCircle2,
  Calendar,
  Award,
  XCircle,
  Users,
  Edit2,
  Trash2,
} from 'lucide-react'

export interface InterviewActionsProps {
  readonly interview: Interview
  readonly onEdit?: () => void
}

const OUTCOME_OPTIONS: { value: InterviewOutcome; label: string }[] = [
  { value: 'PASS', label: 'Pass' },
  { value: 'FAIL', label: 'Fail' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'RECOMMENDED', label: 'Recommended' },
  { value: 'STRONG_RECOMMEND', label: 'Strongly Recommended' },
  { value: 'NOT_RECOMMENDED', label: 'Not Recommended' },
]

export function InterviewActions({ interview, onEdit }: InterviewActionsProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const isTerminal = isTerminalStatus(interview.status)
  const allowedTransitions = getAllowedStatusTransitions(interview.status)

  // Mutations
  const updateStatusMutation = useUpdateInterviewStatus(interview.id)
  const rescheduleMutation = useRescheduleInterview(interview.id)
  const recordOutcomeMutation = useRecordInterviewOutcome(interview.id)
  const cancelMutation = useCancelInterview(interview.id)
  const assignInterviewersMutation = useAssignInterviewers(interview.id)
  const deleteMutation = useDeleteInterview()

  // Modals state
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<InterviewStatus | ''>('')

  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false)
  const [rescheduleDate, setRescheduleDate] = useState(
    interview.scheduledDate ? new Date(interview.scheduledDate).toISOString().split('T')[0] : ''
  )
  const [rescheduleStart, setRescheduleStart] = useState('')
  const [rescheduleEnd, setRescheduleEnd] = useState('')
  const [rescheduleTz, setRescheduleTz] = useState(interview.timeZone || 'UTC')
  const [rescheduleMeetingLink, setRescheduleMeetingLink] = useState(interview.meetingLink || '')
  const [rescheduleLocation, setRescheduleLocation] = useState(interview.location || '')
  const [rescheduleNotes, setRescheduleNotes] = useState(interview.notes || '')

  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = useState(false)
  const [selectedOutcome, setSelectedOutcome] = useState<InterviewOutcome>('PASS')
  const [outcomeNotes, setOutcomeNotes] = useState(interview.resultNotes || '')

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  const [isInterviewersDialogOpen, setIsInterviewersDialogOpen] = useState(false)
  const [interviewerIdsInput, setInterviewerIdsInput] = useState(
    interview.interviewers?.map((i) => i.interviewerId).join(', ') || ''
  )

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // Status transition handler
  const handleStatusSubmit = async () => {
    if (!selectedStatus) return
    setActionError(null)
    try {
      await updateStatusMutation.mutateAsync({ status: selectedStatus })
      setIsStatusDialogOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to update status')
    }
  }

  // Reschedule handler
  const handleRescheduleSubmit = async () => {
    setActionError(null)
    if (!rescheduleDate || !rescheduleStart || !rescheduleEnd) {
      setActionError('Please provide date, start time, and end time.')
      return
    }

    const startIso = new Date(`${rescheduleDate}T${rescheduleStart}:00`).toISOString()
    const endIso = new Date(`${rescheduleDate}T${rescheduleEnd}:00`).toISOString()

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setActionError('End time must be after start time.')
      return
    }
    if (new Date(startIso).getTime() < Date.now()) {
      setActionError('Start time cannot be in the past.')
      return
    }

    try {
      await rescheduleMutation.mutateAsync({
        scheduledDate: new Date(`${rescheduleDate}T00:00:00.000Z`).toISOString(),
        startTime: startIso,
        endTime: endIso,
        timeZone: rescheduleTz.trim() || 'UTC',
        meetingLink: rescheduleMeetingLink.trim() || undefined,
        location: rescheduleLocation.trim() || undefined,
        notes: rescheduleNotes.trim() || undefined,
      })
      setIsRescheduleDialogOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to reschedule interview')
    }
  }

  // Outcome recording handler
  const handleOutcomeSubmit = async () => {
    setActionError(null)
    try {
      await recordOutcomeMutation.mutateAsync({
        outcome: selectedOutcome,
        resultNotes: outcomeNotes.trim() || undefined,
      })
      setIsOutcomeDialogOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to record outcome')
    }
  }

  // Cancellation handler
  const handleCancelSubmit = async () => {
    setActionError(null)
    if (!cancelReason.trim()) {
      setActionError('Cancellation reason is required.')
      return
    }
    try {
      await cancelMutation.mutateAsync({
        cancellationReason: cancelReason.trim(),
      })
      setIsCancelDialogOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to cancel interview')
    }
  }

  // Interviewers assignment handler
  const handleInterviewersSubmit = async () => {
    setActionError(null)
    const ids = interviewerIdsInput
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)

    if (ids.length === 0) {
      setActionError('At least one interviewer ID is required.')
      return
    }

    try {
      await assignInterviewersMutation.mutateAsync({ interviewers: ids })
      setIsInterviewersDialogOpen(false)
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to update interviewers')
    }
  }

  // Delete handler
  const handleDeleteConfirm = async () => {
    setActionError(null)
    try {
      await deleteMutation.mutateAsync(interview.id)
      setIsDeleteDialogOpen(false)
      navigate('/app/interviews')
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message)
      else setActionError('Failed to delete interview')
    }
  }

  return (
    <>
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Interview Actions
        </h3>

        {actionError && (
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <Alert variant="error" title="Action Failed">
              {actionError}
            </Alert>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {/* Edit general notes/location */}
          {!isTerminal && onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Edit2 size={16} style={{ marginRight: '8px' }} />
              Edit Details
            </Button>
          )}

          {/* Status update */}
          {allowedTransitions.length > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedStatus(allowedTransitions[0])
                setIsStatusDialogOpen(true)
              }}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <CheckCircle2 size={16} style={{ marginRight: '8px' }} />
              Update Status
            </Button>
          )}

          {/* Reschedule */}
          {!isTerminal && (
            <Button
              variant="outline"
              onClick={() => setIsRescheduleDialogOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Calendar size={16} style={{ marginRight: '8px' }} />
              Reschedule Interview
            </Button>
          )}

          {/* Record Outcome (COMPLETED only) */}
          {interview.status === 'COMPLETED' && (
            <Button
              variant="primary"
              onClick={() => setIsOutcomeDialogOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Award size={16} style={{ marginRight: '8px' }} />
              Record Outcome & Feedback
            </Button>
          )}

          {/* Assign / Manage Interviewers */}
          {!isTerminal && (
            <Button
              variant="outline"
              onClick={() => setIsInterviewersDialogOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <Users size={16} style={{ marginRight: '8px' }} />
              Assign Interviewers
            </Button>
          )}

          {/* Cancel Interview */}
          {allowedTransitions.includes('CANCELLED') && (
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(true)}
              style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-warning)' }}
            >
              <XCircle size={16} style={{ marginRight: '8px' }} />
              Cancel Interview
            </Button>
          )}

          {/* Delete Interview (Admin only) */}
          {isCompanyAdmin && (
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                color: 'var(--color-error)',
                marginTop: 'var(--space-2)',
              }}
            >
              <Trash2 size={16} style={{ marginRight: '8px' }} />
              Delete Interview
            </Button>
          )}
        </div>
      </Card>

      {/* Status Transition Dialog */}
      <Dialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Update Interview Status"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            Transition interview from <strong>{getStatusLabel(interview.status)}</strong> to:
          </p>
          <Select
            label="Next Status"
            options={allowedTransitions.map((s) => ({
              value: s,
              label: getStatusLabel(s),
            }))}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as InterviewStatus)}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusSubmit}
              isLoading={updateStatusMutation.isPending}
            >
              Apply Status
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        isOpen={isRescheduleDialogOpen}
        onClose={() => setIsRescheduleDialogOpen(false)}
        title="Reschedule Interview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', padding: 'var(--space-2) 0' }}>
          <Input
            label="New Scheduled Date"
            type="date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            required
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Start Time"
              type="time"
              value={rescheduleStart}
              onChange={(e) => setRescheduleStart(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={rescheduleEnd}
              onChange={(e) => setRescheduleEnd(e.target.value)}
              required
            />
          </div>
          <Input
            label="Timezone"
            type="text"
            value={rescheduleTz}
            onChange={(e) => setRescheduleTz(e.target.value)}
            required
          />
          {interview.mode === 'ONLINE' ? (
            <Input
              label="Meeting URL"
              type="url"
              value={rescheduleMeetingLink}
              onChange={(e) => setRescheduleMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              required
            />
          ) : (
            <Input
              label="Location"
              type="text"
              value={rescheduleLocation}
              onChange={(e) => setRescheduleLocation(e.target.value)}
              placeholder="Conference Room B"
            />
          )}
          <Textarea
            label="Rescheduling Notes"
            value={rescheduleNotes}
            onChange={(e) => setRescheduleNotes(e.target.value)}
            rows={3}
            placeholder="Reason for reschedule or updated instructions..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRescheduleSubmit}
              isLoading={rescheduleMutation.isPending}
            >
              Confirm Reschedule
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Record Outcome Dialog */}
      <Dialog
        isOpen={isOutcomeDialogOpen}
        onClose={() => setIsOutcomeDialogOpen(false)}
        title="Record Interview Outcome"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
          <Select
            label="Interview Outcome"
            options={OUTCOME_OPTIONS}
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value as InterviewOutcome)}
          />
          <Textarea
            label="Recruiter Result Notes"
            value={outcomeNotes}
            onChange={(e) => setOutcomeNotes(e.target.value)}
            rows={4}
            placeholder="Detailed assessment notes, feedback, and next steps..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setIsOutcomeDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOutcomeSubmit}
              isLoading={recordOutcomeMutation.isPending}
            >
              Save Outcome
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Cancel Interview Dialog */}
      <Dialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        title="Cancel Interview"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            Please state the reason for cancelling this interview.
          </p>
          <Textarea
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            placeholder="Candidate requested cancellation / Position filled / Scheduling conflict..."
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Back
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelSubmit}
              isLoading={cancelMutation.isPending}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Assign Interviewers Dialog */}
      <Dialog
        isOpen={isInterviewersDialogOpen}
        onClose={() => setIsInterviewersDialogOpen(false)}
        title="Assign Interviewers"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', padding: 'var(--space-2) 0' }}>
          <Input
            label="Interviewer User IDs (comma-separated)"
            value={interviewerIdsInput}
            onChange={(e) => setInterviewerIdsInput(e.target.value)}
            placeholder="usr_123, usr_456"
            required
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => setIsInterviewersDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInterviewersSubmit}
              isLoading={assignInterviewersMutation.isPending}
            >
              Update Interviewers
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete Interview Dialog */}
      {isDeleteDialogOpen && (
        <AtsConfirmDialog
          isOpen={true}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Interview"
          description={`Are you sure you want to delete interview ${interview.interviewCode}? This action is irreversible.`}
          confirmLabel="Delete Interview"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      )}
    </>
  )
}
