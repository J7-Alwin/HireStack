import { Card, Button } from '@/components/ui'
import { Calendar, Clock, Video, MapPin, Globe, FileText, ExternalLink } from 'lucide-react'
import type { Interview } from '../types/interviews.types'
import {
  formatInterviewDate,
  formatInterviewTime,
  calculateDurationMinutes,
  formatDuration,
  getModeLabel,
} from '../utils/interview-helpers'

export interface InterviewScheduleProps {
  readonly interview: Interview
}

export function InterviewSchedule({ interview }: InterviewScheduleProps) {
  const durationMins = calculateDurationMinutes(interview.startTime, interview.endTime)
  const durationText = formatDuration(durationMins)

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
          Interview Schedule & Location
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Calendar size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Scheduled Date
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
              {formatInterviewDate(interview.scheduledDate, interview.timeZone)}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Clock size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Time & Duration
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 600 }}>
              {formatInterviewTime(interview.startTime, interview.timeZone)} –{' '}
              {formatInterviewTime(interview.endTime, interview.timeZone)}
            </span>
            {durationText !== '—' && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>
                ({durationText})
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          <Globe size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Time Zone
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
              {interview.timeZone || 'UTC'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
          {interview.mode === 'ONLINE' ? (
            <Video size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
          ) : (
            <MapPin size={18} style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }} />
          )}
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', display: 'block' }}>
              Mode & Details
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 500 }}>
              {getModeLabel(interview.mode)}
            </span>
          </div>
        </div>
      </div>

      {/* Meeting Link or Physical Location */}
      {interview.meetingLink && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-background-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Video size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
              Meeting URL:
            </span>
            <span
              style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                wordBreak: 'break-all',
              }}
            >
              {interview.meetingLink}
            </span>
          </div>
          <a
            href={interview.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="outline" size="sm">
              <ExternalLink size={14} style={{ marginRight: '4px' }} />
              Open Meeting
            </Button>
          </a>
        </div>
      )}

      {interview.location && (
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-background-subtle)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
          }}
        >
          <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 500 }}>
            Location:
          </span>
          <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            {interview.location}
          </span>
        </div>
      )}

      {/* Instructions & Notes */}
      {interview.notes && (
        <div
          style={{
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <FileText size={16} style={{ color: 'var(--color-text-secondary)' }} />
            <span style={{ fontSize: 'var(--text-body-sm)', fontWeight: 600 }}>
              Preparation & Instructions
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-secondary)',
              whiteSpace: 'pre-wrap',
            }}
          >
            {interview.notes}
          </p>
        </div>
      )}
    </Card>
  )
}
