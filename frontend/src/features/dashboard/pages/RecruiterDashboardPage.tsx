import { Link } from 'react-router-dom'
import { useRecruiterDashboard } from '../hooks'
import { DashboardHeader, KpiCard, PipelineStageBreakdown, DashboardLoadingState } from '../components'
import { Badge, DataTable, ErrorState, EmptyState, Card } from '@/components/ui'
import type { ColumnDef } from '@/components/ui'
import { formatDate, formatPipelineStage } from '../utils'
import { Users, CheckCircle2, Calendar, FileText } from 'lucide-react'
import type { ApplicationSummaryItem, InterviewSummaryItem } from '../types'

export function RecruiterDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useRecruiterDashboard()

  if (isLoading) {
    return <DashboardLoadingState />
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Failed to load recruiter dashboard"
        description={error?.message || 'Unable to retrieve recruiter pipeline metrics.'}
        onRetry={() => void refetch()}
      />
    )
  }

  const { pipelineMetrics, assignedApplications, upcomingInterviews } = data

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

  const interviewColumns: ColumnDef<InterviewSummaryItem>[] = [
    {
      id: 'interviewType',
      header: 'Type / Round',
      cell: (int: InterviewSummaryItem) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Link
            to={`/app/interviews/${int.id}`}
            style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
          >
            {int.round}
          </Link>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {int.interviewType}
          </span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (int: InterviewSummaryItem) => (
        <Badge
          variant={int.status === 'SCHEDULED' ? 'accent' : 'neutral'}
          size="sm"
        >
          {int.status}
        </Badge>
      ),
    },
    {
      id: 'scheduledDate',
      header: 'Scheduled Date',
      cell: (int: InterviewSummaryItem) => formatDate(int.scheduledDate),
    },
  ]

  return (
    <div
      data-testid="recruiter-dashboard"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <DashboardHeader
        title="Recruiting Overview"
        subtitle="Your assigned candidate pipeline and scheduled interview sessions."
        badge={
          <Badge variant="accent" size="sm" withDot>
            Recruiter Workspace
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
          title="Assigned Candidates"
          value={pipelineMetrics.activeCandidates}
          icon={Users}
          detail="In your active pipeline"
        />
        <KpiCard
          title="Candidates Hired"
          value={pipelineMetrics.hiredCount}
          icon={CheckCircle2}
          detail="Placements completed"
        />
        <KpiCard
          title="Interviews Today"
          value={pipelineMetrics.interviewsToday}
          icon={Calendar}
          detail="Scheduled sessions today"
        />
        <KpiCard
          title="Offers Pending"
          value={pipelineMetrics.offersPending}
          icon={FileText}
          detail="Awaiting response"
        />
      </div>

      {/* Stage Breakdown Visual */}
      <PipelineStageBreakdown
        stageBreakdown={pipelineMetrics.stageBreakdown}
        totalActive={pipelineMetrics.activeCandidates}
        title="My Candidate Pipeline Distribution"
      />

      {/* Activity Tables */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {/* Assigned Applications */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            My Assigned Applications
          </h3>

          {assignedApplications.length === 0 ? (
            <EmptyState
              title="No assigned applications"
              description="Applications assigned to you will appear here."
            />
          ) : (
            <DataTable
              columns={applicationColumns}
              data={assignedApplications}
              keyExtractor={(a) => a.id}
            />
          )}
        </Card>

        {/* Upcoming Interviews */}
        <Card variant="elevated" padding="lg">
          <h3
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}
          >
            Scheduled Interviews
          </h3>

          {upcomingInterviews.length === 0 ? (
            <EmptyState
              title="No scheduled interviews"
              description="Upcoming interview rounds will appear here."
            />
          ) : (
            <DataTable
              columns={interviewColumns}
              data={upcomingInterviews}
              keyExtractor={(i) => i.id}
            />
          )}
        </Card>
      </div>
    </div>
  )
}
