import { Card } from '@/components/ui'
import { formatDate } from '@/features/dashboard/utils'
import type { Job } from '../types/jobs.types'
import { Building2, MapPin, Briefcase, DollarSign, Users, Calendar, UserCheck } from 'lucide-react'

export interface JobSummaryProps {
  readonly job: Job
}

export function JobSummary({ job }: JobSummaryProps) {
  const salaryText =
    job.salaryMin && job.salaryMax
      ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'USD'}`
      : job.salaryMin
      ? `From ${job.salaryMin.toLocaleString()} ${job.currency || 'USD'}`
      : job.salaryMax
      ? `Up to ${job.salaryMax.toLocaleString()} ${job.currency || 'USD'}`
      : null

  const experienceText =
    job.experienceMin !== null && job.experienceMin !== undefined && job.experienceMax
      ? `${job.experienceMin} - ${job.experienceMax} years`
      : job.experienceMin !== null && job.experienceMin !== undefined
      ? `${job.experienceMin}+ years`
      : null

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Department & Workplace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Department</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {job.department?.name || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Workplace</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {job.location || 'Remote'} ({job.workplaceType ? job.workplaceType.replace('_', ' ') : '—'})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Briefcase size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Type</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {job.employmentType ? job.employmentType.replace('_', ' ') : '—'}
            </span>
          </div>
        </div>

        {/* Headcount, Salary & Experience */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Openings</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {job.openings} headcount
            </span>
          </div>

          {salaryText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Salary</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {salaryText}
              </span>
            </div>
          )}

          {experienceText && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
              <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Experience</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {experienceText}
              </span>
            </div>
          )}
        </div>

        {/* Recruiter & Publishing Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--text-body-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Recruiter</span>
            <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {job.recruiters && job.recruiters.length > 0
                ? job.recruiters.map((r) => r.recruiter.firstName || r.recruiter.email).join(', ')
                : job.creator?.name || job.creator?.email || '—'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={16} style={{ color: 'var(--color-text-muted)' }} />
            <span style={{ color: 'var(--color-text-secondary)', width: '100px' }}>Created</span>
            <span style={{ color: 'var(--color-text-primary)' }}>
              {formatDate(job.createdAt)}
            </span>
          </div>

          {job.publishedAt && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--color-text-secondary)', width: '100px', marginLeft: '26px' }}>Published</span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                {formatDate(job.publishedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
