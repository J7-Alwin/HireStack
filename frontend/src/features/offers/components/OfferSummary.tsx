import { Card } from '@/components/ui'
import { OfferStatusBadge } from './OfferStatusBadge'
import { formatOfferDate, formatOfferDateTime } from '../utils/offer-helpers'
import { FileText, Calendar, Clock, CheckCircle2, Send, Eye } from 'lucide-react'
import type { Offer } from '../types/offers.types'

export interface OfferSummaryProps {
  readonly offer: Offer
}

export function OfferSummary({ offer }: OfferSummaryProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Offer Code
          </span>
          <h2 style={{ fontSize: 'var(--text-h3)', fontWeight: 700, margin: '2px 0 0 0', color: 'var(--color-text-primary)' }}>
            {offer.offerCode}
          </h2>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-muted)' }}>
            Version {offer.version}
          </span>
        </div>

        <div>
          <OfferStatusBadge status={offer.status} size="md" />
        </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: 'var(--space-4) 0' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }} />
          <div>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              Joining Date
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatOfferDate(offer.joiningDate)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock style={{ width: '18px', height: '18px', color: 'var(--color-warning)' }} />
          <div>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              Expiry Date
            </div>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {formatOfferDate(offer.expiryDate)}
            </div>
          </div>
        </div>

        {offer.approvedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: 'var(--color-success)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                Approved
              </div>
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
                {formatOfferDateTime(offer.approvedAt)}
                {offer.approver?.name ? ` by ${offer.approver.name}` : ''}
              </div>
            </div>
          </div>
        )}

        {offer.sentAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Send style={{ width: '18px', height: '18px', color: 'var(--color-info)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                Sent to Candidate
              </div>
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
                {formatOfferDateTime(offer.sentAt)}
              </div>
            </div>
          </div>
        )}

        {offer.viewedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye style={{ width: '18px', height: '18px', color: 'var(--color-text-secondary)' }} />
            <div>
              <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
                Viewed by Candidate
              </div>
              <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
                {formatOfferDateTime(offer.viewedAt)}
              </div>
            </div>
          </div>
        )}
      </div>

      {offer.offerLetterUrl && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText style={{ width: '18px', height: '18px', color: 'var(--color-text-secondary)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              Offer Letter Document
            </div>
            <a
              href={offer.offerLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 500 }}
            >
              {offer.offerLetterFileName || 'View Offer Letter (PDF)'}
            </a>
          </div>
        </div>
      )}

      {offer.notes && (
        <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'var(--color-warm-white-subtle)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Internal Recruiter Notes:
          </div>
          <div style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
            {offer.notes}
          </div>
        </div>
      )}
    </Card>
  )
}
