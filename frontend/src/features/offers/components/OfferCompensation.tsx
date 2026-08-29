import { Card } from '@/components/ui'
import { formatSalary, getEmploymentTypeLabel } from '../utils/offer-helpers'
import { DollarSign, Briefcase, Gift } from 'lucide-react'
import type { Offer } from '../types/offers.types'

export interface OfferCompensationProps {
  readonly offer: Offer
}

export function OfferCompensation({ offer }: OfferCompensationProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <DollarSign style={{ width: '20px', height: '20px', color: 'var(--color-success)' }} />
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
          Compensation & Terms
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Base / Annual Salary
          </div>
          <div style={{ fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-text-primary)', marginTop: '2px' }}>
            {formatSalary(offer.salary, offer.currency)}
          </div>
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
            Currency: {offer.currency}
          </div>
        </div>

        <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            <Briefcase style={{ width: '14px', height: '14px' }} />
            Employment Type
          </div>
          <div style={{ fontSize: 'var(--text-h4)', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '6px' }}>
            {getEmploymentTypeLabel(offer.employmentType)}
          </div>
        </div>
      </div>

      {offer.benefits && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-body-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            <Gift style={{ width: '16px', height: '16px', color: 'var(--color-primary)' }} />
            Benefits & Perks
          </div>
          <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)', margin: '6px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {offer.benefits}
          </p>
        </div>
      )}
    </Card>
  )
}
