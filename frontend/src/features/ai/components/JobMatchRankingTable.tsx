import { Link } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/ui'
import { AiBadge } from './AiBadge'
import { AiDisclaimer } from './AiDisclaimer'
import {
  getScoreVariant,
  getRecommendationVariant,
  getRecommendationLabel,
} from '../utils/ai-helpers'
import type { CandidateMatchResponse } from '../types'

export interface JobMatchRankingTableProps {
  readonly matches: readonly CandidateMatchResponse[]
  readonly onSelectCandidate?: (candidateId: string) => void
}

export function JobMatchRankingTable({
  matches,
  onSelectCandidate,
}: JobMatchRankingTableProps) {
  // Sort descending by match percentage
  const sortedMatches = [...matches].sort((a, b) => b.matchPercentage - a.matchPercentage)

  return (
    <Card
      variant="elevated"
      padding="md"
      data-testid="job-match-ranking-table"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 600 }}>
              Candidate Match Rankings
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Applicants ranked by weighted qualifications and skill alignment.
          </span>
        </div>

        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
          {sortedMatches.length} candidate{sortedMatches.length === 1 ? '' : 's'} evaluated
        </span>
      </div>

      {sortedMatches.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-8) var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-body-sm)',
            fontStyle: 'italic',
          }}
        >
          No matching candidate evaluations generated yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 'var(--text-body-sm)',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '8px 12px', width: '60px' }}>Rank</th>
                <th style={{ padding: '8px 12px' }}>Candidate</th>
                <th style={{ padding: '8px 12px', width: '120px' }}>Match Score</th>
                <th style={{ padding: '8px 12px', width: '180px' }}>Recommendation</th>
                {onSelectCandidate && <th style={{ padding: '8px 12px', width: '120px', textAlign: 'right' }}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sortedMatches.map((m, index) => {
                const scoreVariant = getScoreVariant(m.matchPercentage)
                const recVariant = getRecommendationVariant(m.recommendation)
                const recLabel = getRecommendationLabel(m.recommendation)

                return (
                  <tr
                    key={m.candidateId}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                      #{index + 1}
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <Link
                        to={`/app/candidates/${m.candidateId}`}
                        style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                      >
                        {m.candidateName}
                      </Link>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={scoreVariant} size="sm">
                        {m.matchPercentage}%
                      </Badge>
                    </td>

                    <td style={{ padding: '10px 12px' }}>
                      <Badge variant={recVariant} size="sm">
                        {recLabel}
                      </Badge>
                    </td>

                    {onSelectCandidate && (
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectCandidate(m.candidateId)}
                        >
                          View Breakdown
                        </Button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <AiDisclaimer />
    </Card>
  )
}
