import { useSuperAdminDashboard } from '../hooks'
import { DashboardHeader, KpiCard, DashboardLoadingState } from '../components'
import { Badge, DataTable, ErrorState, EmptyState, Card } from '@/components/ui'
import type { ColumnDef } from '@/components/ui'
import { formatDate } from '../utils'
import { Building2, Users, CheckCircle2, ShieldCheck } from 'lucide-react'
import type { CompanySummaryItem, UserSummaryItem } from '../types'

export function SuperAdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useSuperAdminDashboard()

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load platform dashboard"
        description={error?.message || 'Unable to retrieve platform metrics from server.'}
        onRetry={() => void refetch()}
      />
    )
  }

  const companyColumns: ColumnDef<CompanySummaryItem>[] = [
    {
      id: 'name',
      header: 'Company',
      cell: (c: CompanySummaryItem) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {c.name}
        </span>
      ),
    },
    {
      id: 'industry',
      header: 'Industry',
      cell: (c: CompanySummaryItem) => c.industry || '—',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (c: CompanySummaryItem) => (
        <Badge
          variant={c.status === 'ACTIVE' ? 'success' : 'neutral'}
          size="sm"
        >
          {c.status}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Onboarded',
      cell: (c: CompanySummaryItem) => formatDate(c.createdAt),
    },
  ]

  const userColumns: ColumnDef<UserSummaryItem>[] = [
    {
      id: 'email',
      header: 'User Email',
      cell: (u: UserSummaryItem) => (
        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
          {u.email}
        </span>
      ),
    },
    {
      id: 'role',
      header: 'Role',
      cell: (u: UserSummaryItem) => (
        <Badge variant="accent" size="sm">
          {u.role}
        </Badge>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (u: UserSummaryItem) => (
        <Badge
          variant={u.status === 'ACTIVE' ? 'success' : 'neutral'}
          size="sm"
        >
          {u.status}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Joined',
      cell: (u: UserSummaryItem) => formatDate(u.createdAt),
    },
  ]

  return (
    <div
      data-testid="super-admin-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <DashboardHeader
        title="Platform Overview"
        subtitle="Platform-wide operational telemetry and tenant infrastructure."
        badge={
          <Badge variant="accent" size="sm" withDot>
            Super Admin Console
          </Badge>
        }
      />

      {/* Platform KPI Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KpiCard
          title="Total Companies"
          value={data.totalCompanies}
          icon={Building2}
          detail="Registered corporate tenants"
        />
        <KpiCard
          title="Active Tenants"
          value={data.activeCompanies}
          icon={CheckCircle2}
          detail="Tenants in active standing"
        />
        <KpiCard
          title="Platform Users"
          value={data.totalUsers}
          icon={Users}
          detail="Total registered accounts"
        />
        <KpiCard
          title="Active Accounts"
          value={data.activeUsers}
          icon={ShieldCheck}
          detail="Accounts in active state"
        />
      </div>

      {/* Tables Row: Recent Companies & Recent Users */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Recent Companies */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Recently Onboarded Companies
          </h3>

          {data.recentCompanies.length === 0 ? (
            <EmptyState
              title="No companies onboarded yet"
              description="New tenant registrations will appear here."
            />
          ) : (
            <DataTable
              columns={companyColumns}
              data={data.recentCompanies}
              keyExtractor={(c) => c.id}
            />
          )}
        </Card>

        {/* Recent Users */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Recent Platform Users
          </h3>

          {data.recentUsers.length === 0 ? (
            <EmptyState
              title="No users registered yet"
              description="Platform users will be listed here."
            />
          ) : (
            <DataTable
              columns={userColumns}
              data={data.recentUsers}
              keyExtractor={(u) => u.id}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
