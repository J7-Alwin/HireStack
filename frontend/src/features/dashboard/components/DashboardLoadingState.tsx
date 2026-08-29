import { Card } from '@/components/ui'

export function DashboardLoadingState() {
  return (
    <div
      data-testid="dashboard-loading-state"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      {/* Header Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            width: '240px',
            height: '32px',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
        <div
          style={{
            width: '360px',
            height: '18px',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-sm)',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}
        />
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {[1, 2, 3, 4].map((item) => (
          <Card
            key={item}
            variant="elevated"
            padding="md"
            style={{
              height: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                width: '90px',
                height: '14px',
                backgroundColor: 'var(--color-warm-white-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
            <div
              style={{
                width: '60px',
                height: '28px',
                backgroundColor: 'var(--color-warm-white-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <Card
        variant="elevated"
        padding="lg"
        style={{
          minHeight: '220px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '180px',
            height: '22px',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-sm)',
          }}
        />
        <div
          style={{
            width: '100%',
            height: '120px',
            backgroundColor: 'var(--color-warm-white-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        />
      </Card>
    </div>
  )
}
