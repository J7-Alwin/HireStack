import { useState, type FormEvent } from 'react'
import { Card, Button, Input } from '@/components/ui'
import { useAddCandidateTag, useDeleteCandidateTag } from '../hooks'
import type { CandidateTag } from '../types/candidates.types'
import { Tag, Plus, X } from 'lucide-react'

export interface CandidateTagsProps {
  readonly candidateId: string
  readonly tags?: readonly CandidateTag[]
}

export function CandidateTags({ candidateId, tags = [] }: CandidateTagsProps) {
  const [name, setName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const addTagMutation = useAddCandidateTag()
  const deleteTagMutation = useDeleteCandidateTag()

  const handleAddTag = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      await addTagMutation.mutateAsync({ candidateId, name: name.trim() })
      setName('')
      setIsAdding(false)
    } catch {
      // Handled by react-query mutation error state
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTagMutation.mutateAsync({ candidateId, tagId })
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
          <Tag size={18} style={{ color: 'var(--color-text-secondary)' }} />
          <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 600, margin: 0 }}>
            Candidate Tags ({tags.length})
          </h3>
        </div>

        {!isAdding && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            iconLeft={<Plus size={14} />}
          >
            Add Tag
          </Button>
        )}
      </div>

      {/* Add Tag Inline Form */}
      {isAdding && (
        <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Input
            placeholder="Tag name (e.g. React, Leadership)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button
            variant="primary"
            size="md"
            type="submit"
            isLoading={addTagMutation.isPending}
            disabled={addTagMutation.isPending || !name.trim()}
          >
            Add
          </Button>
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={() => {
              setIsAdding(false)
              setName('')
            }}
          >
            Cancel
          </Button>
        </form>
      )}

      {/* Tag Chips */}
      {tags.length === 0 ? (
        <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--text-body-sm)' }}>
          No tags assigned yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map((item) => (
            <span
              key={item.tagId}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-warm-white-subtle)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-caption)',
                fontWeight: 500,
                color: 'var(--color-text-primary)',
              }}
            >
              {item.tag?.name || 'Tag'}
              <button
                type="button"
                onClick={() => void handleDeleteTag(item.tagId)}
                aria-label={`Remove tag ${item.tag?.name || ''}`}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
