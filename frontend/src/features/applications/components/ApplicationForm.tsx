import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, Select, Textarea, Button, Alert } from '@/components/ui'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { useAuth } from '@/features/auth'
import type {
  Application,
  CreateApplicationInput,
  CandidateSource,
} from '../types/applications.types'

export interface ApplicationFormProps {
  readonly initialValues?: Partial<Application>
  readonly onSubmit: (data: CreateApplicationInput) => Promise<void> | void
  readonly onCancel: () => void
  readonly isSubmitting?: boolean
  readonly isEdit?: boolean
}

const SOURCE_OPTIONS = [
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'INDEED', label: 'Indeed' },
  { value: 'CAREER_PAGE', label: 'Career Page' },
  { value: 'CONSULTANCY', label: 'Consultancy' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'WALK_IN', label: 'Walk-In' },
  { value: 'IMPORT', label: 'Import' },
  { value: 'OTHER', label: 'Other' },
]

export function ApplicationForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: ApplicationFormProps) {
  const { user } = useAuth()

  const [candidateId, setCandidateId] = useState(initialValues?.candidateId || '')
  const [jobId, setJobId] = useState(initialValues?.jobId || '')
  const [source, setSource] = useState<CandidateSource>(
    (initialValues?.source as CandidateSource) || 'CAREER_PAGE'
  )
  const [remarks, setRemarks] = useState(initialValues?.remarks || '')
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch candidates list for dropdown
  const { data: candidatesData, isLoading: isLoadingCandidates } = useQuery({
    queryKey: ['candidates', 'active-select'],
    queryFn: () => candidatesService.listCandidates({ limit: 100, status: 'ACTIVE' }),
    staleTime: 60 * 1000,
    enabled: !isEdit,
  })

  // Fetch jobs list for dropdown
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', 'open-select'],
    queryFn: () => jobsService.listJobs({ limit: 100, status: 'OPEN' }),
    staleTime: 60 * 1000,
    enabled: !isEdit,
  })

  const candidateOptions = [
    { value: '', label: isLoadingCandidates ? 'Loading candidates...' : 'Select Candidate' },
    ...(candidatesData?.data.map((c) => ({
      value: c.id,
      label: `${c.firstName} ${c.lastName} (${c.email})`,
    })) || []),
  ]

  const jobOptions = [
    { value: '', label: isLoadingJobs ? 'Loading jobs...' : 'Select Job Requisition' },
    ...(jobsData?.data.map((j) => ({
      value: j.id,
      label: `${j.title} (${j.jobCode})`,
    })) || []),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!isEdit) {
      if (!candidateId) {
        setFormError('Please select a candidate.')
        return
      }
      if (!jobId) {
        setFormError('Please select a job requisition.')
        return
      }
    }

    const payload: CreateApplicationInput = {
      candidateId: candidateId || initialValues?.candidateId || '',
      jobId: jobId || initialValues?.jobId || '',
      assignedRecruiterId: user?.id || initialValues?.assignedRecruiterId || '',
      source: source || undefined,
      remarks: remarks.trim() || undefined,
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Failed to save application. Please verify the fields.')
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

      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          {isEdit ? 'Update Application Notes' : 'Application Parameters'}
        </h3>

        {!isEdit ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
            <Select
              label="Candidate"
              options={candidateOptions}
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              required
            />

            <Select
              label="Target Job Requisition"
              options={jobOptions}
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              required
            />

            <Select
              label="Application Source"
              options={SOURCE_OPTIONS}
              value={source}
              onChange={(e) => setSource(e.target.value as CandidateSource)}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <p style={{ margin: 0 }}>
              Updating notes for application <strong>{initialValues?.applicationCode}</strong>.
            </p>
          </div>
        )}

        <div style={{ marginTop: 'var(--space-4)' }}>
          <Textarea
            label="Remarks & Internal Notes"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="Add any initial recruiter remarks, referral notes, or evaluation context..."
          />
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Application'}
        </Button>
      </div>
    </form>
  )
}
