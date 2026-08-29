import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import type {
  ApplicationFilterParams,
  ApplicationStage,
  ApplicationStatus,
  CandidateSource,
} from '../types/applications.types'

export interface ApplicationFiltersProps {
  readonly params: ApplicationFilterParams
  readonly onSearchChange: (search: string) => void
  readonly onStageChange: (stage?: ApplicationStage) => void
  readonly onStatusChange: (status?: ApplicationStatus) => void
  readonly onSourceChange: (source?: CandidateSource) => void
  readonly onReset: () => void
}

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'OFFER', label: 'Offer' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
  { value: 'ARCHIVED', label: 'Archived' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
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

export function ApplicationFilters({
  params,
  onSearchChange,
  onStageChange,
  onStatusChange,
  onSourceChange,
  onReset,
}: ApplicationFiltersProps) {
  const activeCount = [
    params.search,
    params.stage,
    params.status,
    params.source,
  ].filter(Boolean).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '240px', flex: 1 }}>
        <SearchInput
          placeholder="Search by candidate name, job title, or code..."
          value={params.search || ''}
          onChange={onSearchChange}
        />
      </div>

      <div style={{ width: '170px' }}>
        <Select
          options={STAGE_OPTIONS}
          value={params.stage || ''}
          onChange={(e) => {
            const val = e.target.value
            onStageChange(val ? (val as ApplicationStage) : undefined)
          }}
          placeholder="Filter stage"
        />
      </div>

      <div style={{ width: '160px' }}>
        <Select
          options={STATUS_OPTIONS}
          value={params.status || ''}
          onChange={(e) => {
            const val = e.target.value
            onStatusChange(val ? (val as ApplicationStatus) : undefined)
          }}
          placeholder="Filter status"
        />
      </div>

      <div style={{ width: '160px' }}>
        <Select
          options={SOURCE_OPTIONS}
          value={params.source || ''}
          onChange={(e) => {
            const val = e.target.value
            onSourceChange(val ? (val as CandidateSource) : undefined)
          }}
          placeholder="Filter source"
        />
      </div>
    </AtsFilterBar>
  )
}
