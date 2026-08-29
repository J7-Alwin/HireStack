import { useState, useEffect, type FormEvent } from 'react'
import { Dialog, Select, Textarea, Input, Button, Alert, Checkbox } from '@/components/ui'
import { PipelineStageBadge } from './PipelineStageBadge'
import {
  getAllowedTransitions,
  getStageLabel,
} from '../utils/pipeline-helpers'
import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import type { Pipeline, PipelineStage, MoveStageInput } from '../types/pipeline.types'

export interface PipelineMoveModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly pipeline: Pipeline | null
  readonly onConfirm: (input: MoveStageInput) => Promise<void>
  readonly isLoading?: boolean
}

export function PipelineMoveModal({
  isOpen,
  onClose,
  pipeline,
  onConfirm,
  isLoading = false,
}: PipelineMoveModalProps) {
  const { user } = useAuth()
  const isCompanyAdmin = user?.role === Role.COMPANY_ADMIN

  const [toStage, setToStage] = useState<PipelineStage | ''>('')
  const [reason, setReason] = useState('')
  const [comments, setComments] = useState('')
  const [isOverride, setIsOverride] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pipeline) {
      const allowed = getAllowedTransitions(pipeline.currentStage, false)
      setToStage(allowed.length > 0 ? allowed[0] : '')
      setReason('')
      setComments('')
      setIsOverride(false)
      setError(null)
    }
  }, [pipeline, isOpen])

  if (!pipeline) return null

  const allowedStages = getAllowedTransitions(pipeline.currentStage, isOverride)

  const stageOptions = [
    { value: '', label: 'Select Target Stage' },
    ...allowedStages.map((s) => ({
      value: s,
      label: `${getStageLabel(s)}${isOverride ? ' (Admin Override)' : ''}`,
    })),
  ]

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!toStage) {
      setError('Please select a target stage.')
      return
    }

    if (isOverride && reason.trim().length < 10) {
      setError('Admin stage override requires an explanation reason of at least 10 characters.')
      return
    }

    try {
      await onConfirm({
        toStage: toStage as PipelineStage,
        reason: reason.trim() || undefined,
        comments: comments.trim() || undefined,
        isOverride,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to move candidate to target stage.')
    }
  }

  const candidateName = pipeline.candidate
    ? `${pipeline.candidate.firstName} ${pipeline.candidate.lastName}`
    : 'Candidate'

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title="Move Candidate Stage"
      description={`Advance or update recruitment workflow stage for ${candidateName}.`}
      size="md"
    >
      <form
        noValidate
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginTop: 'var(--space-2)',
        }}
      >
        {error && (
          <Alert variant="error" title="Movement Error">
            {error}
          </Alert>
        )}

        {/* Current State Info */}
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              Current Stage
            </span>
            <div style={{ marginTop: '2px' }}>
              <PipelineStageBadge stage={pipeline.currentStage} size="md" />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              Job Requisition
            </span>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>
              {pipeline.job?.title || 'Job'}
            </div>
          </div>
        </div>

        {/* Admin Override Toggle */}
        {isCompanyAdmin && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warm-white-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--color-border-subtle)',
            }}
          >
            <Checkbox
              id="admin-override-checkbox"
              label="Enable Administrator Stage Override (jump/skip stages)"
              checked={isOverride}
              onChange={(e) => {
                const checked = e.target.checked
                setIsOverride(checked)
                const newAllowed = getAllowedTransitions(pipeline.currentStage, checked)
                setToStage(newAllowed.length > 0 ? newAllowed[0] : '')
              }}
            />
          </div>
        )}

        {/* Target Stage Select */}
        <Select
          label="Target Stage"
          options={stageOptions}
          value={toStage}
          onChange={(e) => setToStage(e.target.value as PipelineStage)}
          required
        />

        {/* Reason Input (Mandatory if override) */}
        {isOverride && (
          <Input
            label="Override Reason (Mandatory)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Fast-tracked candidate directly from executive referral"
            required={isOverride}
            maxLength={500}
          />
        )}

        {/* Notes / Comments */}
        <Textarea
          label="Transition Comments / Notes (Optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add any recruitment notes or context regarding this stage transition..."
          rows={3}
          maxLength={1000}
        />

        {/* Modal Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          <Button
            variant="outline"
            size="md"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
            Confirm Stage Move
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
