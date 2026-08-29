import { AtsFilterBar } from '@/components/ats'
import { SearchInput, Select } from '@/components/ui'
import type {
  OfferFilterParams,
  OfferStatus,
  OfferCurrency,
  EmploymentType,
} from '../types/offers.types'

export interface OfferFiltersProps {
  readonly params: OfferFilterParams
  readonly onSearchChange: (search: string) => void
  readonly onStatusChange: (status?: OfferStatus) => void
  readonly onCurrencyChange: (currency?: OfferCurrency) => void
  readonly onEmploymentTypeChange: (type?: EmploymentType) => void
  readonly onReset: () => void
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'SENT', label: 'Sent' },
  { value: 'VIEWED', label: 'Viewed' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'DECLINED', label: 'Declined' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
]

const CURRENCY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Currencies' },
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'AED', label: 'AED' },
  { value: 'SGD', label: 'SGD (S$)' },
]

const EMPLOYMENT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Employment' },
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERN', label: 'Intern' },
  { value: 'TEMPORARY', label: 'Temporary' },
  { value: 'FREELANCE', label: 'Freelance' },
]

export function OfferFilters({
  params,
  onSearchChange,
  onStatusChange,
  onCurrencyChange,
  onEmploymentTypeChange,
  onReset,
}: OfferFiltersProps) {
  const activeCount = [
    params.search,
    params.status,
    params.currency,
    params.employmentType,
  ].filter(Boolean).length

  return (
    <AtsFilterBar onClear={onReset} activeFiltersCount={activeCount}>
      <div style={{ minWidth: '240px', flex: 1 }}>
        <SearchInput
          placeholder="Search by offer code, candidate name, job title..."
          value={params.search || ''}
          onChange={onSearchChange}
          aria-label="Search offers"
        />
      </div>

      <div style={{ width: '160px' }}>
        <Select
          options={STATUS_OPTIONS}
          value={params.status || ''}
          onChange={(e) => {
            const val = e.target.value
            onStatusChange(val ? (val as OfferStatus) : undefined)
          }}
          aria-label="Filter status"
        />
      </div>

      <div style={{ width: '150px' }}>
        <Select
          options={CURRENCY_OPTIONS}
          value={params.currency || ''}
          onChange={(e) => {
            const val = e.target.value
            onCurrencyChange(val ? (val as OfferCurrency) : undefined)
          }}
          aria-label="Filter currency"
        />
      </div>

      <div style={{ width: '160px' }}>
        <Select
          options={EMPLOYMENT_OPTIONS}
          value={params.employmentType || ''}
          onChange={(e) => {
            const val = e.target.value
            onEmploymentTypeChange(val ? (val as EmploymentType) : undefined)
          }}
          aria-label="Filter employment type"
        />
      </div>
    </AtsFilterBar>
  )
}
