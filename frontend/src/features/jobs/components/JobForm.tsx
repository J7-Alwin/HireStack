import { useState, type FormEvent } from 'react'
import { Card, Input, Select, Textarea, Button, Alert } from '@/components/ui'
import { useDepartmentOptions } from '../hooks'
import type {
  Job,
  CreateJobInput,
  EmploymentType,
  WorkplaceType,
} from '../types/jobs.types'

export interface JobFormProps {
  readonly initialValues?: Partial<Job>
  readonly onSubmit: (data: CreateJobInput) => Promise<void> | void
  readonly onCancel: () => void
  readonly isSubmitting?: boolean
  readonly isEdit?: boolean
}

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

const WORKPLACE_TYPE_OPTIONS = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
]

export function JobForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: JobFormProps) {
  const { data: departments = [] } = useDepartmentOptions()

  const [title, setTitle] = useState(initialValues?.title || '')
  const [departmentId, setDepartmentId] = useState(
    initialValues?.departmentId || (departments[0]?.id ?? '')
  )
  const [openings, setOpenings] = useState(
    initialValues?.openings !== undefined ? String(initialValues.openings) : '1'
  )
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    initialValues?.employmentType || 'FULL_TIME'
  )
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>(
    initialValues?.workplaceType || 'HYBRID'
  )
  const [location, setLocation] = useState(initialValues?.location || '')
  const [experienceMin, setExperienceMin] = useState(
    initialValues?.experienceMin !== undefined && initialValues?.experienceMin !== null
      ? String(initialValues.experienceMin)
      : ''
  )
  const [experienceMax, setExperienceMax] = useState(
    initialValues?.experienceMax !== undefined && initialValues?.experienceMax !== null
      ? String(initialValues.experienceMax)
      : ''
  )
  const [salaryMin, setSalaryMin] = useState(
    initialValues?.salaryMin !== undefined && initialValues?.salaryMin !== null
      ? String(initialValues.salaryMin)
      : ''
  )
  const [salaryMax, setSalaryMax] = useState(
    initialValues?.salaryMax !== undefined && initialValues?.salaryMax !== null
      ? String(initialValues.salaryMax)
      : ''
  )
  const [currency, setCurrency] = useState(initialValues?.currency || 'USD')

  const [description, setDescription] = useState(initialValues?.description || '')
  const [responsibilities, setResponsibilities] = useState(initialValues?.responsibilities || '')
  const [requirements, setRequirements] = useState(initialValues?.requirements || '')
  const [benefits, setBenefits] = useState(initialValues?.benefits || '')

  const [formError, setFormError] = useState<string | null>(null)

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    ...departments.map((d) => ({ value: d.id, label: d.name })),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!title.trim()) {
      setFormError('Job title is required.')
      return
    }

    if (!departmentId) {
      setFormError('Please select a department.')
      return
    }

    if (!description.trim()) {
      setFormError('Job description is required.')
      return
    }

    const parsedOpenings = parseInt(openings, 10)
    if (isNaN(parsedOpenings) || parsedOpenings < 1) {
      setFormError('Openings must be at least 1.')
      return
    }

    const payload: CreateJobInput = {
      title: title.trim(),
      departmentId,
      description: description.trim(),
      responsibilities: responsibilities.trim() || undefined,
      requirements: requirements.trim() || undefined,
      benefits: benefits.trim() || undefined,
      employmentType,
      workplaceType,
      openings: parsedOpenings,
      location: location.trim() || undefined,
      experienceMin: experienceMin ? parseInt(experienceMin, 10) : undefined,
      experienceMax: experienceMax ? parseInt(experienceMax, 10) : undefined,
      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      currency: currency.trim() || undefined,
    }

    try {
      await onSubmit(payload)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message)
      } else {
        setFormError('Failed to save job requisition. Please check the fields.')
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

      {/* 1. Job Information */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Role Overview
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Input
            label="Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Senior Frontend Engineer"
          />

          <Select
            label="Department"
            options={departmentOptions}
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
          />

          <Input
            label="Headcount Openings"
            type="number"
            value={openings}
            onChange={(e) => setOpenings(e.target.value)}
            required
            min={1}
          />

          <Select
            label="Employment Type"
            options={EMPLOYMENT_TYPE_OPTIONS}
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            required
          />

          <Select
            label="Workplace Type"
            options={WORKPLACE_TYPE_OPTIONS}
            value={workplaceType}
            onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
            required
          />

          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. San Francisco, CA or Remote"
          />
        </div>
      </Card>

      {/* 2. Job Description & Specifications */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Job Description & Requirements
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Textarea
            label="Overview / Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Describe the core mission, team context, and high-level role purpose..."
          />

          <Textarea
            label="Key Responsibilities"
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            rows={3}
            placeholder="Outline primary duties and day-to-day expectations..."
          />

          <Textarea
            label="Requirements & Qualifications"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            placeholder="Required skills, domain knowledge, education, and track record..."
          />

          <Textarea
            label="Benefits & Perks"
            value={benefits}
            onChange={(e) => setBenefits(e.target.value)}
            rows={2}
            placeholder="Health benefits, equity, flexible vacation, equipment stipend..."
          />
        </div>
      </Card>

      {/* 3. Compensation & Experience */}
      <Card variant="elevated" padding="lg">
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
          Experience & Compensation
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
          <Input
            label="Min Experience (Years)"
            type="number"
            value={experienceMin}
            onChange={(e) => setExperienceMin(e.target.value)}
            placeholder="e.g. 3"
          />
          <Input
            label="Max Experience (Years)"
            type="number"
            value={experienceMax}
            onChange={(e) => setExperienceMax(e.target.value)}
            placeholder="e.g. 7"
          />
          <Input
            label="Min Salary"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            placeholder="e.g. 120000"
          />
          <Input
            label="Max Salary"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            placeholder="e.g. 160000"
          />
          <Input
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            placeholder="USD"
            maxLength={3}
          />
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEdit ? 'Save Changes' : 'Create Job Requisition'}
        </Button>
      </div>
    </form>
  )
}
