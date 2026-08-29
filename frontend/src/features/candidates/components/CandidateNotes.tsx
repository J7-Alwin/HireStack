import { useState, type FormEvent } from 'react'
import { Card, Button, Textarea, EmptyState } from '@/components/ui'
import { formatDate } from '@/features/dashboard/utils'
import { useAddCandidateNote, useDeleteCandidateNote } from '../hooks'
import type { CandidateNote } from '../types/candidates.types'
import { MessageSquare, Trash2, Plus } from 'lucide-react'

export interface CandidateNotesProps {
  readonly candidateId: string
  readonly notes?: readonly CandidateNote[]
}

export function CandidateNotes({ candidateId, notes = [] }: CandidateNotesProps) {
  const [content, setContent] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const addNoteMutation = useAddCandidateNote()
  const deleteNoteMutation = useDeleteCandidateNote()

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await addNoteMutation.mutateAsync({ candidateId, content: content.trim() })
      setContent('')
      setIsAdding(false)
    } catch {
      // Handled by react-query mutation error state
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNoteMutation.mutateAsync({ candidateId, noteId })
    } catch {
      // Handled by react-query mutation error state
    }
  }

  return (
    <Card variant="elevated" padding="lg">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Recruiter Notes ({notes.length})
          </h3>
        </div>

        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            iconLeft={<Plus size={14} />}
          >
            Add Note
          </Button>
        )}
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <form onSubmit={handleAddNote} style={{ marginBottom: 'var(--space-6)' }}>
          <Textarea
            placeholder="Write a recruiter note about this candidate..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 'var(--space-2)',
              marginTop: 'var(--space-3)',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setIsAdding(false)
                setContent('')
              }}
              disabled={addNoteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={addNoteMutation.isPending}
              disabled={addNoteMutation.isPending || !content.trim()}
            >
              Save Note
            </Button>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <EmptyState
          title="No notes added yet"
          description="Keep track of interviews, feedback, and key observations here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-warm-white-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {note.author?.name || 'Recruiter'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {formatDate(note.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleDeleteNote(note.id)}
                    aria-label="Delete note"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '2px',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--leading-relaxed)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
