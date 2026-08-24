import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { DecorativeSpark } from '@/components/ui/decorative'

/**
 * Root Foundation Screen (Development Placeholder)
 * Incorporates HireStack Editorial SaaS visual direction.
 */
export function FoundationRoot() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        backgroundColor: 'var(--color-background)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Card
        variant="elevated"
        padding="lg"
        style={{
          maxWidth: '560px',
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ position: 'absolute', top: '-12px', right: '-12px' }}>
          <DecorativeSpark size={28} color="var(--color-lime)" />
        </div>

        <Badge variant="accent" withDot size="sm">
          Stage 2 Design System
        </Badge>

        <h1
          style={{
            fontSize: 'var(--text-h1)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: 'var(--tracking-tight)',
            margin: 0,
          }}
        >
          HireStack ATS
        </h1>

        <p
          style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-text-secondary)',
            margin: 0,
            lineHeight: 'var(--leading-relaxed)',
          }}
        >
          Frontend foundation initialized.
        </p>
      </Card>
    </main>
  )
}
