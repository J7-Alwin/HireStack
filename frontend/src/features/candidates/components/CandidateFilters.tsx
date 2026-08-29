import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import type { CandidateFilterParams, CandidateStatus, CandidateSource } from '../types/candidates.types'

export interface CandidateFiltersProps {
  readonly params: CandidateFilterParams
  readonly onSearchChange: (search: string) => void
  readonly onStatusChange: (status?: CandidateStatus) => void
  readonly onSourceChange: (source?: CandidateSource) => void
  readonly onReset: () => void
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'BLACKLISTED', label: 'Blacklisted' },
]

const SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'DIRECT_APPLICATION', label: 'Direct Application' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'CAREER_FAIR', label: 'Career Fair' },
  { value: 'OTHER', label: 'Other' },
]

export function CandidateFilters({
  params,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onReset,
}: CandidateFiltersProps) {
  const activeCount = [params.search, params.status, params.source].filter(
    Boolean
  ).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '240px', flex: 1 }}>
        <SearchInput
          placeholder="Search by name, email, or company..."
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
            onStatusChange(val ? (val as CandidateStatus) : undefined)
          }}
          placeholder="Filter by status"
        />
      </div>

      <div style={{ width: '180px' }}>
        <Select
          options={SOURCE_OPTIONS}
          value={params.source || ''}
          onChange={(e) => {
            const val = e.target.value
            onSourceChange(val ? (val as CandidateSource) : undefined)
          }}
          placeholder="Filter by source"
        />
      </div>
    </AtsFilterBar>
  )
}
