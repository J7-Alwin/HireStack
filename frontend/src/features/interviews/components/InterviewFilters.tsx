import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import type {
  InterviewFilterParams,
  InterviewStatus,
  InterviewType,
  InterviewRound,
  InterviewMode,
  InterviewOutcome,
} from '../types/interviews.types'

export interface InterviewFiltersProps {
  readonly params: InterviewFilterParams
  readonly onSearchChange: (search: string) => void
  readonly onStatusChange: (status?: InterviewStatus) => void
  readonly onRoundChange: (round?: InterviewRound) => void
  readonly onTypeChange: (type?: InterviewType) => void
  readonly onModeChange: (mode?: InterviewMode) => void
  readonly onOutcomeChange: (outcome?: InterviewOutcome) => void
  readonly onReset: () => void
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
]

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'CAMPUS', label: 'Campus' },
  { value: 'WALK_IN', label: 'Walk-In' },
  { value: 'OTHER', label: 'Other' },
]

const ROUND_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Rounds' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'MANAGERIAL', label: 'Managerial' },
  { value: 'HR', label: 'HR' },
  { value: 'FINAL', label: 'Final' },
]

const MODE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Modes' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'ONSITE', label: 'Onsite' },
  { value: 'PHONE', label: 'Phone' },
]

const OUTCOME_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Outcomes' },
  { value: 'PASS', label: 'Passed' },
  { value: 'FAIL', label: 'Failed' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'RECOMMENDED', label: 'Recommended' },
  { value: 'STRONG_RECOMMEND', label: 'Strongly Recommended' },
  { value: 'NOT_RECOMMENDED', label: 'Not Recommended' },
]

export function InterviewFilters({
  params,
  onSearchChange,
  onStatusChange,
  onRoundChange,
  onTypeChange,
  onModeChange,
  onOutcomeChange,
  onReset,
}: InterviewFiltersProps) {
  const activeCount = [
    params.search,
    params.status,
    params.round,
    params.interviewType,
    params.mode,
    params.outcome,
  ].filter(Boolean).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '240px', flex: 1 }}>
        <SearchInput
          placeholder="Search by code, candidate, job, or interviewer..."
          value={params.search || ''}
          onChange={onSearchChange}
          aria-label="Search interviews"
        />
      </div>

      <div style={{ width: '150px' }}>
        <Select
          options={STATUS_OPTIONS}
          value={params.status || ''}
          onChange={(e) => {
            const val = e.target.value
            onStatusChange(val ? (val as InterviewStatus) : undefined)
          }}
          aria-label="Filter status"
        />
      </div>

      <div style={{ width: '150px' }}>
        <Select
          options={ROUND_OPTIONS}
          value={params.round || ''}
          onChange={(e) => {
            const val = e.target.value
            onRoundChange(val ? (val as InterviewRound) : undefined)
          }}
          aria-label="Filter round"
        />
      </div>

      <div style={{ width: '140px' }}>
        <Select
          options={TYPE_OPTIONS}
          value={params.interviewType || ''}
          onChange={(e) => {
            const val = e.target.value
            onTypeChange(val ? (val as InterviewType) : undefined)
          }}
          aria-label="Filter type"
        />
      </div>

      <div style={{ width: '130px' }}>
        <Select
          options={MODE_OPTIONS}
          value={params.mode || ''}
          onChange={(e) => {
            const val = e.target.value
            onModeChange(val ? (val as InterviewMode) : undefined)
          }}
          aria-label="Filter mode"
        />
      </div>

      <div style={{ width: '160px' }}>
        <Select
          options={OUTCOME_OPTIONS}
          value={params.outcome || ''}
          onChange={(e) => {
            const val = e.target.value
            onOutcomeChange(val ? (val as InterviewOutcome) : undefined)
          }}
          aria-label="Filter outcome"
        />
      </div>
    </AtsFilterBar>
  )
}
