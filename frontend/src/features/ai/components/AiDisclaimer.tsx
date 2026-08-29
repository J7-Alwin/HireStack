import { Info } from 'lucide-react'

export interface AiDisclaimerProps {
  readonly customMessage?: string
}

export function AiDisclaimer({
  customMessage = 'AI-generated information is provided as decision support and should be reviewed by a qualified recruiter or hiring professional.',
}: AiDisclaimerProps) {
  return (
    <div
      data-testid="ai-disclaimer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        backgroundColor: 'var(--color-surface-hover)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--text-caption)',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.4,
      }}
    >
      <Info
        size={14}
        style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}
        aria-hidden="true"
      />
      <span>{customMessage}</span>
    </div>
  )
}
