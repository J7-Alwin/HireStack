import { useState, type FormEvent } from 'react'
import { Card, Input, Select, Textarea, Button, Alert } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import { applicationsService } from '@/features/applications/services/applications.service'
import type {
  Offer,
  CreateOfferInput,
  UpdateOfferInput,
  OfferCurrency,
  EmploymentType,
} from '../types/offers.types'

export interface OfferFormProps {
  readonly initialValues?: Partial<Offer>
  readonly isEdit?: boolean
  readonly isRevision?: boolean
  readonly onSubmit: (data: CreateOfferInput | UpdateOfferInput) => Promise<void>
  readonly onCancel: () => void
  readonly isSubmitting?: boolean
}

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR — Indian Rupee (₹)' },
  { value: 'USD', label: 'USD — US Dollar ($)' },
  { value: 'EUR', label: 'EUR — Euro (€)' },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'SGD', label: 'SGD — Singapore Dollar (S$)' },
]

const EMPLOYMENT_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Internship' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'FREELANCE', label: 'Freelance' },
]

export function OfferForm({
  initialValues,
  isEdit = false,
  isRevision = false,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: OfferFormProps) {
  // Format date helper for input type="date"
  const getInitialDate = (dateStr?: string | null) => {
    if (!dateStr) return ''
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return ''
      return d.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const [applicationId, setApplicationId] = useState(initialValues?.applicationId || '')
  const [salary, setSalary] = useState(
    initialValues?.salary !== undefined ? String(initialValues.salary) : ''
  )
  const [currency, setCurrency] = useState<OfferCurrency>(initialValues?.currency || 'USD')
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialValues?.employmentType || 'FULL_TIME'
  )
  const [joiningDate, setJoiningDate] = useState(getInitialDate(initialValues?.joiningDate))
  const [expiryDate, setExpiryDate] = useState(getInitialDate(initialValues?.expiryDate))
  const [benefits, setBenefits] = useState(initialValues?.benefits || '')
  const [notes, setNotes] = useState(initialValues?.notes || '')
  const [offerLetterUrl, setOfferLetterUrl] = useState(initialValues?.offerLetterUrl || '')
  const [offerLetterFileName, setOfferLetterFileName] = useState(
    initialValues?.offerLetterFileName || ''
  )
  const [formError, setFormError] = useState<string | null>(null)

  // Fetch active applications list for dropdown when creating
  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery({
    queryKey: ['applications', 'active-select'],
    queryFn: () => applicationsService.listApplications({ limit: 100, status: 'ACTIVE' }),
    staleTime: 60 * 1000,
    enabled: !isEdit && !isRevision,
  })

  // Selected application details preview
  const selectedApplication = applicationsData?.data.find((a) => a.id === applicationId)

  const applicationOptions = [
    {
      value: '',
      label: isLoadingApplications
        ? 'Loading active applications...'
        : 'Select Active Application',
    },
    ...(applicationsData?.data.map((a) => ({
      value: a.id,
      label: `${a.applicationCode} — ${
        a.candidate ? `${a.candidate.firstName} ${a.candidate.lastName}` : 'Candidate'
      } (${a.job?.title || 'Job'})`,
    })) || []),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const numSalary = Number(salary)
    if (isNaN(numSalary) || numSalary <= 0) {
      setFormError('Salary must be a positive number greater than zero.')
      return
    }

    if (!isEdit && !applicationId) {
      setFormError('Please select an active application for this offer.')
      return
    }

    if (!joiningDate) {
      setFormError('Please provide a proposed joining date.')
      return
    }

    if (!expiryDate) {
      setFormError('Please provide an offer expiration date.')
      return
    }

    const join = new Date(joiningDate)
    const expiry = new Date(expiryDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (join < today) {
      setFormError('Joining date cannot be in the past.')
      return
    }

    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    if (expiry <= endOfToday) {
      setFormError('Expiry date must be in the future.')
      return
    }

    if (expiry >= join) {
      setFormError('Offer expiry date must be strictly before the proposed joining date.')
      return
    }

    try {
      if (isEdit) {
        const updatePayload: UpdateOfferInput = {
          salary: numSalary,
          currency,
          employmentType,
          joiningDate: new Date(joiningDate).toISOString(),
          expiryDate: new Date(expiryDate).toISOString(),
          benefits: benefits.trim() || null,
          notes: notes.trim() || null,
          offerLetterUrl: offerLetterUrl.trim() || null,
          offerLetterFileName: offerLetterFileName.trim() || null,
        }
        await onSubmit(updatePayload)
      } else {
        const createPayload: CreateOfferInput = {
          applicationId,
          salary: numSalary,
          currency,
          employmentType,
          joiningDate: new Date(joiningDate).toISOString(),
          expiryDate: new Date(expiryDate).toISOString(),
          benefits: benefits.trim() || null,
          notes: notes.trim() || null,
          offerLetterUrl: offerLetterUrl.trim() || null,
          offerLetterFileName: offerLetterFileName.trim() || null,
        }
        await onSubmit(createPayload)
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save offer.')
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

      {/* 1. Application Context */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          {isEdit ? 'Offer Context' : isRevision ? 'Revision Target' : 'Application Target'}
        </h3>

        {!isEdit && !isRevision ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Select
              label="Application"
              options={applicationOptions}
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              required
              disabled={isLoadingApplications}
            />

            {selectedApplication && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  padding: 'var(--space-4)',
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
                    {selectedApplication.candidate?.firstName}{' '}
                    {selectedApplication.candidate?.lastName}
                  </strong>{' '}
                  ({selectedApplication.candidate?.email || '—'})
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Job Requisition:</span>{' '}
                  <strong>{selectedApplication.job?.title || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Current Stage:</span>{' '}
                  <span>{selectedApplication.stage.replace(/_/g, ' ')}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            <p style={{ margin: 0 }}>
              Offer Code: <strong>{initialValues?.offerCode || '—'}</strong>
              {initialValues?.version ? ` (Version ${initialValues.version})` : ''}
            </p>
            {initialValues?.application && (
              <p style={{ margin: '4px 0 0 0' }}>
                Candidate:{' '}
                <strong>
                  {initialValues.application.candidate.firstName}{' '}
                  {initialValues.application.candidate.lastName}
                </strong>{' '}
                • Job: <strong>{initialValues.application.job.title}</strong>
              </p>
            )}
          </div>
        )}
      </Card>

      {/* 2. Compensation & Terms */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Compensation & Terms
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <Input
            label="Annual/Base Salary"
            type="number"
            min="1"
            step="any"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            placeholder="e.g. 850000"
            required
          />

          <Select
            label="Currency"
            options={CURRENCY_OPTIONS}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as OfferCurrency)}
            required
          />

          <Select
            label="Employment Type"
            options={EMPLOYMENT_OPTIONS}
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            required
          />
        </div>
      </Card>

      {/* 3. Schedule & Deadlines */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Offer Schedule & Dates
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <Input
            label="Offer Expiry Date"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            required
          />

          <Input
            label="Proposed Joining Date"
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            required
          />
        </div>
      </Card>

      {/* 4. Benefits, Letter & Notes */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Benefits & Documentation
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Textarea
            label="Benefits & Perks"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            placeholder="e.g. Health insurance, 401(k) matching, annual performance bonus, remote allowance..."
            rows={3}
            maxLength={5000}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Input
              label="Offer Letter Document URL (Optional)"
              type="url"
              value={offerLetterUrl}
              onChange={(e) => setOfferLetterUrl(e.target.value)}
              placeholder="https://storage.company.com/offers/letter.pdf"
            />

            <Input
              label="Offer Letter File Name (Optional)"
              value={offerLetterFileName}
              onChange={(e) => setOfferLetterFileName(e.target.value)}
              placeholder="e.g. John_Doe_Offer_Letter.pdf"
            />
          </div>

          <Textarea
            label="Internal Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal hiring manager or recruiter notes regarding this offer..."
            rows={3}
            maxLength={3000}
          />
        </div>
      </Card>

      {/* 5. Form Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        <Button variant="ghost" size="md" onClick={onCancel} type="button" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" size="md" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : isRevision ? 'Create Revision' : 'Create Offer Draft'}
        </Button>
      </div>
    </form>
  )
}
