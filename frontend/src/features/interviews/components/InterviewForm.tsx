import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Input, Select, Textarea, Button, Alert } from '@/components/ui'
import { applicationsService } from '@/features/applications/services/applications.service'
import { useAuth } from '@/features/auth'
import type {
  Interview,
  CreateInterviewInput,
  UpdateInterviewInput,
  InterviewType,
  InterviewRound,
  InterviewMode,
} from '../types/interviews.types'

export interface InterviewFormProps {
  readonly initialValues?: Partial<Interview>
  readonly onSubmit: (data: CreateInterviewInput | UpdateInterviewInput) => Promise<void> | void
  readonly onCancel: () => void
  readonly isSubmitting?: boolean
  readonly isEdit?: boolean
}

const TYPE_OPTIONS: { value: InterviewType; label: string }[] = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'WALK_IN', label: 'Walk-In' },
  { value: 'OTHER', label: 'Other' },
]

const ROUND_OPTIONS: { value: InterviewRound; label: string }[] = [
  { value: 'SCREENING', label: 'Screening' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'HR', label: 'HR' },
  { value: 'FINAL', label: 'Final' },
]

const MODE_OPTIONS: { value: InterviewMode; label: string }[] = [
  { value: 'ONLINE', label: 'Online Video' },
  { value: 'ONSITE', label: 'On-Site' },
  { value: 'PHONE', label: 'Phone' },
]

export function InterviewForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: InterviewFormProps) {
  const { user } = useAuth()

  // System default timezone
  const defaultTimezone =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      : 'UTC'

  // Extract initial date/time values if available
  const getInitialDate = () => {
    if (initialValues?.scheduledDate) {
      return new Date(initialValues.scheduledDate).toISOString().split('T')[0]
    }
    return ''
  }

  const getInitialTime = (dateStr?: string) => {
    if (dateStr) {
      const d = new Date(dateStr)
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return ''
  }

  const [applicationId, setApplicationId] = useState(initialValues?.applicationId || '')
  const [interviewType, setInterviewType] = useState<InterviewType>(
    initialValues?.interviewType || 'INTERNAL'
  )
  const [round, setRound] = useState<InterviewRound>(initialValues?.round || 'TECHNICAL')
  const [mode, setMode] = useState<InterviewMode>(initialValues?.mode || 'ONLINE')
  const [scheduledDate, setScheduledDate] = useState(getInitialDate())
  const [startTimeStr, setStartTimeStr] = useState(getInitialTime(initialValues?.startTime))
  const [endTimeStr, setEndTimeStr] = useState(getInitialTime(initialValues?.endTime))
  const [timeZone, setTimeZone] = useState(initialValues?.timeZone || defaultTimezone)
  const [meetingLink, setMeetingLink] = useState(initialValues?.meetingLink || '')
  const [location, setLocation] = useState(initialValues?.location || '')
  const [notes, setNotes] = useState(initialValues?.notes || '')
  const [interviewerId, setInterviewerId] = useState(
    initialValues?.interviewers?.[0]?.interviewerId || user?.id || ''
  )
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch active applications list for dropdown when creating
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['applications', 'active-select'],
    queryFn: () => applicationsService.listApplications({ limit: 100, status: 'ACTIVE' }),
    staleTime: 60 * 1000,
    enabled: !isEdit,
  })

  // Selected application details
  const selectedApplication = applicationsData?.data.find((a) => a.id === applicationId)

  const applicationOptions = [
    { value: '', label: isLoadingApplications ? 'Loading active applications...' : 'Select Active Application' },
    ...(applicationsData?.data.map((a) => ({
      value: a.id,
      label: `${a.applicationCode} — ${a.candidate ? `${a.candidate.firstName} ${a.candidate.lastName}` : 'Candidate'} (${a.job?.title || 'Job'})`,
    })) || []),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (isEdit) {
      if (mode === 'ONLINE' && !meetingLink.trim()) {
        setFormError('Online interview requires a meeting link.')
        return
      }
      if (mode === 'ONSITE' && !location.trim()) {
        setFormError('Onsite interview requires a location.')
        return
      }

      const payload: UpdateInterviewInput = {
        mode,
        meetingLink: meetingLink.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      }

      try {
        await onSubmit(payload)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setFormError(err.message)
        } else {
          setFormError('Failed to update interview. Please check the inputs.')
        }
      }
      return
    }

    // Validation for Create
    if (!applicationId) {
      setFormError('Please select an active application.')
      return
    }
    if (!scheduledDate) {
      setFormError('Please select a scheduled date.')
      return
    }
    if (!startTimeStr || !endTimeStr) {
      setFormError('Please provide both start and end times.')
      return
    }

    // Construct full ISO datetime strings
    const startIso = new Date(`${scheduledDate}T${startTimeStr}:00`).toISOString()
    const endIso = new Date(`${scheduledDate}T${endTimeStr}:00`).toISOString()

    const startTimestamp = new Date(startIso).getTime()
    const endTimestamp = new Date(endIso).getTime()

    if (endTimestamp <= startTimestamp) {
      setFormError('End time must be later than start time.')
      return
    }

    if (startTimestamp < Date.now()) {
      setFormError('Scheduled start time cannot be in the past.')
      return
    }

    if (mode === 'ONLINE' && !meetingLink.trim()) {
      setFormError('Online interview requires a meeting link.')
      return
    }
    if (mode === 'ONSITE' && !location.trim()) {
      setFormError('Onsite interview requires a location.')
      return
    }

    const assignedInterviewers = interviewerId ? [interviewerId] : [user?.id || '']
    if (assignedInterviewers.length === 0 || !assignedInterviewers[0]) {
      setFormError('At least one interviewer must be assigned.')
      return
    }

    const payload: CreateInterviewInput = {
      applicationId,
      interviewType,
      round,
      mode,
      scheduledDate: new Date(`${scheduledDate}T00:00:00.000Z`).toISOString(),
      startTime: startIso,
      endTime: endIso,
      timeZone: timeZone.trim() || 'UTC',
      meetingLink: meetingLink.trim() || undefined,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      interviewers: assignedInterviewers,
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Failed to schedule interview. Please check the inputs.')
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      {formError && (
        <Alert variant="error" title="Validation Error">
          {formError}
        </Alert>
      )}

      {/* Application / Candidate / Job Context */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          {isEdit ? 'Interview Context' : 'Application Context'}
        </h3>

        {!isEdit ? (
          <div>
            <Select
              label="Application"
              options={applicationOptions}
              value={applicationId}
              onChange={(e) => {
                const appId = e.target.value
                setApplicationId(appId)
                const app = applicationsData?.data.find((a) => a.id === appId)
                if (app?.assignedRecruiterId) {
                  setInterviewerId(app.assignedRecruiterId)
                }
              }}
              required
            />

            {selectedApplication && (
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-background-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--text-body-sm)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Candidate:</span>{' '}
                  <strong>
                    {selectedApplication.candidate?.firstName} {selectedApplication.candidate?.lastName}
                  </strong>{' '}
                  ({selectedApplication.candidate?.email || '—'})
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Job Requisition:</span>{' '}
                  <strong>{selectedApplication.job?.title || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Assigned Recruiter:</span>{' '}
                  <span>
                    {selectedApplication.assignedRecruiter?.firstName ||
                      selectedApplication.assignedRecruiter?.name ||
                      '—'}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <p style={{ margin: 0 }}>
              Updating details for interview <strong>{initialValues?.interviewCode}</strong>.
            </p>
            {initialValues?.application?.candidate && (
              <p style={{ margin: 'var(--space-1) 0 0' }}>
                Candidate:{' '}
                <strong>
                  {initialValues.application.candidate.firstName} {initialValues.application.candidate.lastName}
                </strong>{' '}
                | Job: <strong>{initialValues.application.job?.title}</strong>
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Round & Mode Details */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Interview Parameters
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          {!isEdit && (
            <>
              <Select
                label="Interview Round"
                options={ROUND_OPTIONS}
                value={round}
                onChange={(e) => setRound(e.target.value as InterviewRound)}
                required
              />

              <Select
                label="Interview Type"
                options={TYPE_OPTIONS}
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                required
              />
            </>
          )}

          <Select
            label="Interview Mode"
            options={MODE_OPTIONS}
            value={mode}
            onChange={(e) => setMode(e.target.value as InterviewMode)}
            required
          />
        </div>

        {/* Location or Meeting Link */}
        <div style={{ marginTop: 'var(--space-4)' }}>
          {mode === 'ONLINE' ? (
            <Input
              label="Meeting URL"
              type="url"
              placeholder="https://meet.google.com/abc-defg-hij or Zoom link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              required
            />
          ) : mode === 'ONSITE' ? (
            <Input
              label="Onsite Location"
              type="text"
              placeholder="Conference Room A, 4th Floor, HQ"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          ) : (
            <Input
              label="Phone Number / Dial-in Details"
              type="text"
              placeholder="Candidate or recruiter phone number"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          )}
        </div>
      </Card>

      {/* Schedule Parameters (Create Mode Only) */}
      {!isEdit && (
        <Card variant="elevated" padding="lg">
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
            Schedule & Timezone
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Input
              label="Scheduled Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />

            <Input
              label="Start Time"
              type="time"
              value={startTimeStr}
              onChange={(e) => setStartTimeStr(e.target.value)}
              required
            />

            <Input
              label="End Time"
              type="time"
              value={endTimeStr}
              onChange={(e) => setEndTimeStr(e.target.value)}
              required
            />

            <Input
              label="Timezone"
              type="text"
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Input
              label="Assigned Interviewer ID"
              type="text"
              value={interviewerId}
              onChange={(e) => setInterviewerId(e.target.value)}
              placeholder="User ID of interviewer (defaults to current user or recruiter)"
              required
            />
          </div>
        </Card>
      )}

      {/* Notes */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Notes & Preparation
        </h3>
        <Textarea
          label="Interviewer Instructions & Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add agenda, topics to cover, preparation notes for the interviewers..."
        />
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Schedule Interview'}
        </Button>
      </div>
    </form>
  )
}
