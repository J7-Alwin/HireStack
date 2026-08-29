import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import { useQuery } from '@tanstack/react-query'
import { jobsService } from '@/features/jobs/services/jobs.service'
import type { PipelineQueryFilters, PipelineStage } from '../types/pipeline.types'

export interface PipelineFiltersProps {
  readonly filters: PipelineQueryFilters
  readonly onSearchChange: (search: string) => void
  readonly onJobChange: (jobId?: string) => void
  readonly onStageChange: (stage?: PipelineStage) => void
  readonly onStatusCategoryChange: (statusCat?: 'active' | 'completed' | 'all') => void
  readonly onReset: () => void
}

const STAGE_OPTIONS = [
  { value: '', label: 'All Stages' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SCREENING', label: 'Screening' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'HR_INTERVIEW', label: 'HR Interview' },
  { value: 'TECHNICAL_INTERVIEW', label: 'Technical Interview' },
  { value: 'FINAL_INTERVIEW', label: 'Final Interview' },
  { value: 'OFFER_PENDING', label: 'Offer Pending' },
  { value: 'OFFER_SENT', label: 'Offer Sent' },
  { value: 'OFFER_ACCEPTED', label: 'Offer Accepted' },
  { value: 'HIRED', label: 'Hired' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

const STATUS_CAT_OPTIONS = [
  { value: 'active', label: 'Active Pipeline' },
  { value: 'completed', label: 'Completed (Terminal)' },
  { value: 'all', label: 'All Candidates' },
]

export function PipelineFilters({
  filters,
  onSearchChange,
  onJobChange,
  onStageChange,
  onStatusCategoryChange,
  onReset,
}: PipelineFiltersProps) {
  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', 'select-options'],
    queryFn: () => jobsService.listJobs({ limit: 100 }),
    staleTime: 60 * 1000,
  })

  const jobOptions = [
    { value: '', label: isLoadingJobs ? 'Loading jobs...' : 'All Jobs' },
    ...(jobsData?.data.map((j) => ({
      value: j.id,
      label: `${j.title} (${j.jobCode || 'Req'})`,
    })) || []),
  ]

  let currentStatusCat: 'active' | 'completed' | 'all' = 'active'
  if (filters.completed) {
    currentStatusCat = 'completed'
  } else if (filters.active === false && !filters.completed) {
    currentStatusCat = 'all'
  }

  const activeCount = [
    filters.search,
    filters.jobId,
    filters.currentStage,
    currentStatusCat !== 'active' ? currentStatusCat : null,
  ].filter(Boolean).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '220px', flex: 1 }}>
        <SearchInput
          placeholder="Search by candidate name, code, job..."
          value={filters.search || ''}
          onChange={onSearchChange}
          aria-label="Search pipeline"
        />
      </div>

      <div style={{ width: '220px' }}>
        <Select
          options={jobOptions}
          value={filters.jobId || ''}
          onChange={(e) => onJobChange(e.target.value || undefined)}
          disabled={isLoadingJobs}
          aria-label="Filter by job"
        />
      </div>

      <div style={{ width: '180px' }}>
        <Select
          options={STAGE_OPTIONS}
          value={filters.currentStage || ''}
          onChange={(e) => {
            const val = e.target.value
            onStageChange(val ? (val as PipelineStage) : undefined)
          }}
          aria-label="Filter by stage"
        />
      </div>

      <div style={{ width: '170px' }}>
        <Select
          options={STATUS_CAT_OPTIONS}
          value={currentStatusCat}
          onChange={(e) => {
            onStatusCategoryChange(e.target.value as 'active' | 'completed' | 'all')
          }}
          aria-label="Filter by active or completed"
        />
      </div>
    </AtsFilterBar>
  )
}
