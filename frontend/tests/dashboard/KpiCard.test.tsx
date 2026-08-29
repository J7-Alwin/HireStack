import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { Users } from 'lucide-react'

describe('KpiCard Component', () => {
  it('renders title, formatted numeric value, and detail string', () => {
    render(
      <KpiCard
        title="Active Candidates"
        value={1420}
        icon={Users}
        detail="Total currently in pipeline"
      />
    )

    expect(screen.getByText('Active Candidates')).toBeInTheDocument()
    expect(screen.getByText('1,420')).toBeInTheDocument()
    expect(screen.getByText('Total currently in pipeline')).toBeInTheDocument()
  })

  it('renders skeleton pulse when isLoading is true', () => {
    render(<KpiCard title="Active Candidates" value={1420} isLoading={true} />)

    expect(screen.getByTestId('kpi-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('1,420')).not.toBeInTheDocument()
  })

  it('renders dash fallback when value is null or undefined', () => {
    render(<KpiCard title="Offers Pending" value={null} />)

    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
