import { useCandidateDashboard } from '../hooks'
import { DashboardHeader, KpiCard, DashboardLoadingState } from '../components'
import { Badge, ErrorState, Card, Button } from '@/components/ui'
import { FileText, Calendar, UserCheck, Briefcase } from 'lucide-react'

export function CandidateDashboardPage() {
  const { data: user, isLoading, isError, error, refetch } = useCandidateDashboard()

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (isError || !user) {
    return (
      <ErrorState
        title="Failed to load candidate portal"
        description={error?.message || 'Unable to retrieve candidate account details.'}
        onRetry={() => void refetch()}
      />
    )
  }

  return (
    <div
      data-testid="candidate-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <DashboardHeader
        title="Welcome to Your Candidate Portal"
        subtitle="Track your applications, interview schedules, and career opportunities."
        badge={
          <Badge variant="accent" size="sm" withDot>
            Candidate Portal
          </Badge>
        }
      />

      {/* Summary KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KpiCard
          title="Account Status"
          value={user.status}
          icon={UserCheck}
          detail={`Registered as ${user.email}`}
        />
        <KpiCard
          title="My Applications"
          value="Active"
          icon={FileText}
          detail="Application tracking"
        />
        <KpiCard
          title="My Interviews"
          value="Ready"
          icon={Calendar}
          detail="Upcoming interview rounds"
        />
      </div>

      {/* Profile & Journey Info Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Candidate Profile
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: 'var(--text-body-sm)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Email</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {user.email}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Status</span>
              <Badge variant="success" size="sm">
                {user.status}
              </Badge>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Role</span>
              <Badge variant="accent" size="sm">
                {user.role}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Next Steps / Quick Actions */}
        <Card
          variant="elevated"
          padding="lg"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 'var(--text-h4)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
              }}
            >
              Career Opportunities
            </h3>
            <p
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
              }}
            >
              Stay tuned for active job listings, recruiter interview invitations, and status notifications.
            </p>
          </div>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button
              variant="outline"
              size="sm"
              iconLeft={<Briefcase size={14} />}
              onClick={() => {
                // Future job explorer foundation
              }}
            >
              Explore Open Positions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
