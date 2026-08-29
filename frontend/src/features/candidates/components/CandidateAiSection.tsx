import { Card, Tabs, type TabItem } from '@/components/ui'
import { AiBadge, AiDisclaimer } from '@/features/ai/components'
import { CandidateAtsScore } from './CandidateAtsScore'
import { CandidateResumeRecommendations } from './CandidateResumeRecommendations'
import { CandidateAiInsights } from './CandidateAiInsights'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { Target, FileText, Brain } from 'lucide-react'

export interface CandidateAiSectionProps {
  readonly candidateId: string
}

export function CandidateAiSection({ candidateId }: CandidateAiSectionProps) {
  const { user } = useAuth()

  // SUPER_ADMIN is forbidden from company-scoped AI intelligence
  if (user?.role === Role.SUPER_ADMIN) {
    return null
  }

  const isCandidateRole = user?.role === Role.CANDIDATE

  // Candidate roles only have access to resume recommendations for their own profile
  const tabItems: TabItem[] = isCandidateRole
    ? [
        {
          id: 'resume-recommendations',
          label: 'Resume Recommendations',
          icon: <FileText size={15} />,
          content: <CandidateResumeRecommendations candidateId={candidateId} />,
        },
      ]
    : [
        {
          id: 'ats-score',
          label: 'ATS Compatibility Score',
          icon: <Target size={15} />,
          content: <CandidateAtsScore candidateId={candidateId} />,
        },
        {
          id: 'resume-recommendations',
          label: 'Resume Recommendations',
          icon: <FileText size={15} />,
          content: <CandidateResumeRecommendations candidateId={candidateId} />,
        },
        {
          id: 'recruiter-insights',
          label: 'Recruiter AI Insights',
          icon: <Brain size={15} />,
          content: <CandidateAiInsights candidateId={candidateId} />,
        },
      ]

  return (
    <Card
      variant="elevated"
      padding="lg"
      data-testid="candidate-ai-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--color-surface)',
        width: '100%',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-h3)', fontWeight: 600 }}>
              AI Candidate Intelligence
            </h3>
            <AiBadge />
          </div>
          <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
            Advisory evaluation tools for qualification scoring, resume optimization, and hiring risk synthesis.
          </span>
        </div>
      </div>

      <Tabs items={tabItems} defaultTabId={tabItems[0].id} variant="pills" />

      <div style={{ marginTop: 'var(--space-2)' }}>
        <AiDisclaimer />
      </div>
    </Card>
  )
}
