import { Link } from 'react-router-dom'
import { useCompanyAdminDashboard } from '../hooks'
import { DashboardHeader, KpiCard, PipelineStageBreakdown, DashboardLoadingState } from '../components'
import { Badge, DataTable, ErrorState, EmptyState, Card } from '@/components/ui'
import type { ColumnDef } from '@/components/ui'
import { formatDate, formatPipelineStage } from '../utils'
import { Users, CheckCircle2, Calendar, FileText } from 'lucide-react'
import type { JobSummaryItem, ApplicationSummaryItem } from '../types'

export function CompanyAdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useCompanyAdminDashboard()

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load company dashboard"
        description={error?.message || 'Unable to retrieve company metrics from server.'}
        onRetry={() => void refetch()}
      />
    )
  }

  const { pipelineMetrics, recentJobs, recentApplications } = data

  const jobColumns: ColumnDef<JobSummaryItem>[] = [
    {
      id: 'title',
      header: 'Job Title',
      cell: (job: JobSummaryItem) => (
        <Link
          to={`/app/jobs/${job.id}`}
          style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
        >
          {job.title}
        </Link>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (job: JobSummaryItem) => (
        <Badge
          variant={job.status === 'OPEN' ? 'success' : 'neutral'}
          size="sm"
        >
          {job.status}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      cell: (job: JobSummaryItem) => formatDate(job.createdAt),
    },
  ]

  const applicationColumns: ColumnDef<ApplicationSummaryItem>[] = [
    {
      id: 'applicationCode',
      header: 'Application',
      cell: (app: ApplicationSummaryItem) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            to={`/app/applications/${app.id}`}
            style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
          >
            {app.applicationCode}
          </Link>
          {app.candidate && (
            <Link
              to={`/app/candidates/${app.candidate.id}`}
              style={{ fontSize: '11px', color: 'var(--color-text-muted)', textDecoration: 'none' }}
            >
              {app.candidate.firstName} {app.candidate.lastName}
            </Link>
          )}
        </div>
      ),
    },
    {
      id: 'stage',
      header: 'Stage',
      cell: (app: ApplicationSummaryItem) => (
        <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
          {formatPipelineStage(app.stage)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (app: ApplicationSummaryItem) => (
        <Badge
          variant={
            app.status === 'HIRED'
              ? 'success'
              : app.status === 'REJECTED'
                ? 'error'
                : 'neutral'
          }
          size="sm"
        >
          {app.status}
        </Badge>
      ),
    },
    {
      id: 'createdAt',
      header: 'Applied Date',
      cell: (app: ApplicationSummaryItem) => formatDate(app.appliedAt || app.createdAt),
    },
  ]

  return (
    <div
      data-testid="company-admin-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <DashboardHeader
        title="Company Overview"
        subtitle="Real-time hiring pipeline telemetry and talent acquisition metrics."
        badge={
          <Badge variant="neutral" size="sm" withDot>
            Company Admin
          </Badge>
        }
      />

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        <KpiCard
          title="Active Candidates"
          value={pipelineMetrics.activeCandidates}
          icon={Users}
          detail="In-progress applications"
        />
        <KpiCard
          title="Candidates Hired"
          value={pipelineMetrics.hiredCount}
          icon={CheckCircle2}
          detail="Successful offers completed"
        />
        <KpiCard
          title="Interviews Today"
          value={pipelineMetrics.interviewsToday}
          icon={Calendar}
          detail="Scheduled interview sessions"
        />
        <KpiCard
          title="Offers Pending"
          value={pipelineMetrics.offersPending}
          icon={FileText}
          detail="Awaiting candidate/admin decision"
        />
      </div>

      {/* Stage Breakdown Visual */}
      <PipelineStageBreakdown
        stageBreakdown={pipelineMetrics.stageBreakdown}
        totalActive={pipelineMetrics.activeCandidates}
      />

      {/* Recent Activity Sections */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Recent Applications */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Recent Applications
          </h3>

          {recentApplications.length === 0 ? (
            <EmptyState
              title="No recent applications"
              description="Candidate applications will appear here as they are received."
            />
          ) : (
            <DataTable
              columns={applicationColumns}
              data={recentApplications}
              keyExtractor={(a) => a.id}
            />
          )}
        </Card>

        {/* Recent Jobs */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Active Job Openings
          </h3>

          {recentJobs.length === 0 ? (
            <EmptyState
              title="No jobs created yet"
              description="Open requisitions will be listed here."
            />
          ) : (
            <DataTable
              columns={jobColumns}
              data={recentJobs}
              keyExtractor={(j) => j.id}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
