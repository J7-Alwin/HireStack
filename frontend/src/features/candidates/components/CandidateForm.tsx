import { useState, type FormEvent } from 'react'
import { Card, Input, Select, Button, Alert } from '@/components/ui'
import { useAuth } from '@/features/auth'
import type {
  Candidate,
  CreateCandidateInput,
  CandidateStatus,
  CandidateSource,
  Gender,
  EmploymentStatus,
} from '../types/candidates.types'

export interface CandidateFormProps {
  readonly initialValues?: Partial<Candidate>
  readonly onSubmit: (data: CreateCandidateInput) => Promise<void> | void
  readonly onCancel: () => void
  readonly isSubmitting?: boolean
  readonly isEdit?: boolean
}

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'Select Source' },
  { value: 'DIRECT_APPLICATION', label: 'Direct Application' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'CAREER_FAIR', label: 'Career Fair' },
  { value: 'OTHER', label: 'Other' },
]

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '', label: 'Select Employment Status' },
  { value: 'EMPLOYED', label: 'Employed' },
  { value: 'UNEMPLOYED', label: 'Unemployed' },
  { value: 'FREELANCER', label: 'Freelancer' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'NOTICE_PERIOD', label: 'Serving Notice Period' },
]

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
]

export function CandidateForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: CandidateFormProps) {
  const { user } = useAuth()

  const [firstName, setFirstName] = useState(initialValues?.firstName || '')
  const [lastName, setLastName] = useState(initialValues?.lastName || '')
  const [email, setEmail] = useState(initialValues?.email || '')
  const [phone, setPhone] = useState(initialValues?.phone || '')
  const [alternatePhone, setAlternatePhone] = useState(initialValues?.alternatePhone || '')
  const [gender, setGender] = useState<Gender | ''>((initialValues?.gender as Gender) || '')
  const [city, setCity] = useState(initialValues?.city || '')
  const [state, setState] = useState(initialValues?.state || '')
  const [country, setCountry] = useState(initialValues?.country || '')
  const [currentCompany, setCurrentCompany] = useState(initialValues?.currentCompany || '')
  const [currentDesignation, setCurrentDesignation] = useState(initialValues?.currentDesignation || '')
  const [experienceYears, setExperienceYears] = useState(
    initialValues?.experienceYears !== undefined && initialValues?.experienceYears !== null
      ? String(initialValues.experienceYears)
      : ''
  )
  const [noticePeriod, setNoticePeriod] = useState(
    initialValues?.noticePeriod !== undefined && initialValues?.noticePeriod !== null
      ? String(initialValues.noticePeriod)
      : ''
  )
  const [source, setSource] = useState<CandidateSource | ''>(
    (initialValues?.source as CandidateSource) || 'DIRECT_APPLICATION'
  )
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | ''>(
    (initialValues?.employmentStatus as EmploymentStatus) || ''
  )
  const [status, setStatus] = useState<CandidateStatus>(
    initialValues?.status || 'ACTIVE'
  )
  const [linkedInUrl, setLinkedInUrl] = useState(initialValues?.linkedInUrl || '')
  const [githubUrl, setGithubUrl] = useState(initialValues?.githubUrl || '')
  const [portfolioUrl, setPortfolioUrl] = useState(initialValues?.portfolioUrl || '')

  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!firstName.trim() || !lastName.trim()) {
      setFormError('First and last name are required.')
      return
    }

    if (!email.trim() && !phone.trim()) {
      setFormError('At least an email address or phone number is required.')
      return
    }

    const payload: CreateCandidateInput = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      alternatePhone: alternatePhone.trim() || null,
      gender: gender ? (gender as Gender) : null,
      city: city.trim() || null,
      state: state.trim() || null,
      country: country.trim() || null,
      currentCompany: currentCompany.trim() || null,
      currentDesignation: currentDesignation.trim() || null,
      experienceYears: experienceYears ? Number(experienceYears) : null,
      noticePeriod: noticePeriod ? Number(noticePeriod) : null,
      source: source ? (source as CandidateSource) : null,
      employmentStatus: employmentStatus ? (employmentStatus as EmploymentStatus) : null,
      linkedInUrl: linkedInUrl.trim() || null,
      githubUrl: githubUrl.trim() || null,
      portfolioUrl: portfolioUrl.trim() || null,
      primaryRecruiterId: initialValues?.primaryRecruiterId || user?.id || '',
      ...(isEdit ? { status } : {}),
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Failed to save candidate. Please check the form fields.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {formError && (
        <Alert variant="error" title="Submission Error">
          {formError}
        </Alert>
      )}

      {/* 1. Basic Information */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Basic Information
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            placeholder="e.g. John"
          />
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            placeholder="e.g. Doe"
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john.doe@example.com"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
          />
          <Input
            label="Alternate Phone"
            type="tel"
            value={alternatePhone}
            onChange={(e) => setAlternatePhone(e.target.value)}
            placeholder="Optional secondary phone"
          />
          <Select
            label="Gender"
            options={GENDER_OPTIONS}
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
          />
        </div>
      </Card>

      {/* 2. Professional Details */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Professional Experience
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Input
            label="Current Company"
            value={currentCompany}
            onChange={(e) => setCurrentCompany(e.target.value)}
            placeholder="e.g. Acme Tech"
          />
          <Input
            label="Current Designation"
            value={currentDesignation}
            onChange={(e) => setCurrentDesignation(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
          />
          <Input
            label="Years of Experience"
            type="number"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g. 5"
          />
          <Input
            label="Notice Period (Days)"
            type="number"
            value={noticePeriod}
            onChange={(e) => setNoticePeriod(e.target.value)}
            placeholder="e.g. 30"
          />
          <Select
            label="Source"
            options={SOURCE_OPTIONS}
            value={source}
            onChange={(e) => setSource(e.target.value as CandidateSource)}
          />
          <Select
            label="Employment Status"
            options={EMPLOYMENT_STATUS_OPTIONS}
            value={employmentStatus}
            onChange={(e) => setEmploymentStatus(e.target.value as EmploymentStatus)}
          />

          {isEdit && (
            <Select
              label="Candidate Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={(e) => setStatus(e.target.value as CandidateStatus)}
            />
          )}
        </div>
      </Card>

      {/* 3. Location & Profiles */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Location & Links
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. San Francisco"
          />
          <Input
            label="State / Province"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g. CA"
          />
          <Input
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. United States"
          />
          <Input
            label="LinkedIn URL"
            type="url"
            value={linkedInUrl}
            onChange={(e) => setLinkedInUrl(e.target.value)}
            placeholder="https://linkedin.com/in/username"
          />
          <Input
            label="GitHub URL"
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
          />
          <Input
            label="Portfolio / Website"
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://portfolio.me"
          />
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Candidate'}
        </Button>
      </div>
    </form>
  )
}
