import { Card, EmptyState } from '@/components/ui'
import { formatDate } from '@/features/dashboard/utils'
import type { CandidateDocument } from '../types/candidates.types'
import { FileText, Download } from 'lucide-react'

export interface CandidateResumeProps {
  readonly documents?: readonly CandidateDocument[]
}

export function CandidateResume({ documents = [] }: CandidateResumeProps) {
  const resumes = documents.filter((doc) => doc.documentType === 'RESUME' || !doc.documentType)

  return (
    <Card variant="elevated" padding="lg">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
        <FileText size={18} style={{ color: 'var(--color-text-secondary)' }} />
        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
          Resume & Documents ({documents.length})
        </h3>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No resume attached"
          description="Candidate has not uploaded a resume or CV document."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(resumes.length > 0 ? resumes : documents).map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--color-warm-white-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FileText size={20} style={{ color: 'var(--color-accent)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-primary)' }}>
                    {doc.fileName}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Uploaded {formatDate(doc.createdAt)}
                    {doc.fileSize ? ` • ${(doc.fileSize / 1024).toFixed(1)} KB` : ''}
                  </span>
                </div>
              </div>

              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--color-text-primary)',
                    textDecoration: 'none',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 500,
                    padding: '6px 12px',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Download size={14} />
                  <span>Download</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
