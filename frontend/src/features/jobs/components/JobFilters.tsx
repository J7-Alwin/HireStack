import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import { useDepartmentOptions } from '../hooks'
import type { JobFilterParams, JobStatus, EmploymentType } from '../types/jobs.types'

export interface JobFiltersProps {
  readonly params: JobFilterParams
  readonly onSearchChange: (search: string) => void
  readonly onStatusChange: (status?: JobStatus) => void
  readonly onEmploymentTypeChange: (type?: EmploymentType) => void
  readonly onDepartmentChange: (departmentId?: string) => void
  readonly onReset: () => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

export function JobFilters({
  params,
  onSearchChange,
  onStatusChange,
  onEmploymentTypeChange,
  onDepartmentChange,
  onReset,
}: JobFiltersProps) {
  const { data: departments = [] } = useDepartmentOptions()

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })),
  ]

  const activeCount = [
    params.search,
    params.status,
    params.employmentType,
    params.department,
  ].filter(Boolean).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '240px', flex: 1 }}>
        <SearchInput
          placeholder="Search by job title or keyword..."
          value={params.search || ''}
          onChange={onSearchChange}
        />
      </div>

      <div style={{ width: '180px' }}>
        <Select
          options={STATUS_OPTIONS}
          value={params.status || ''}
          onChange={(e) => {
            const val = e.target.value
            onStatusChange(val ? (val as JobStatus) : undefined)
          }}
          placeholder="Filter by status"
        />
      </div>

      <div style={{ width: '180px' }}>
        <Select
          options={EMPLOYMENT_TYPE_OPTIONS}
          value={params.employmentType || ''}
          onChange={(e) => {
            const val = e.target.value
            onEmploymentTypeChange(val ? (val as EmploymentType) : undefined)
          }}
          placeholder="Employment type"
        />
      </div>

      {departments.length > 0 && (
        <div style={{ width: '180px' }}>
          <Select
            options={departmentOptions}
            value={params.department || ''}
            onChange={(e) => {
              const val = e.target.value
              onDepartmentChange(val || undefined)
            }}
            placeholder="Department"
          />
        </div>
      )}
    </AtsFilterBar>
  )
}
