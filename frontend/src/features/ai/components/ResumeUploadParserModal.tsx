import { useState, useRef, type ChangeEvent, type FormEvent } from 'react'
import { Dialog, Button, Alert } from '@/components/ui'
import { useParseResume } from '../hooks/useParseResume'
import { validateResumeFile } from '../utils/ai-helpers'
import { AiBadge } from './AiBadge'
import { AiLoadingState } from './AiLoadingState'
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react'
import type { Candidate } from '@/features/candidates'

export interface ResumeUploadParserModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onSuccess?: (candidate: Candidate) => void
}

export function ResumeUploadParserModal({
  isOpen,
  onClose,
  onSuccess,
}: ResumeUploadParserModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [createdCandidate, setCreatedCandidate] = useState<Candidate | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseMutation = useParseResume()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    setValidationError(null)
    setCreatedCandidate(null)

    if (selected) {
      const validation = validateResumeFile(selected)
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid resume file.')
        setFile(null)
        return
      }
      setFile(selected)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setValidationError(null)
    setCreatedCandidate(null)

    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      const validation = validateResumeFile(dropped)
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid resume file.')
        setFile(null)
        return
      }
      setFile(dropped)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file) {
      setValidationError('Please select a PDF resume file.')
      return
    }

    try {
      const candidate = await parseMutation.mutateAsync(file)
      setCreatedCandidate(candidate)
      if (onSuccess) {
        onSuccess(candidate)
      }
    } catch {
      // Error handled by mutation state
    }
  }

  const handleClose = () => {
    if (parseMutation.isPending) return
    setFile(null)
    setValidationError(null)
    setCreatedCandidate(null)
    parseMutation.reset()
    onClose()
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload & Parse Candidate Resume"
      description="Extract structured candidate credentials, contact details, experience, and skills directly from a PDF resume using local AI."
      size="md"
    >
      {createdCandidate ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: 'var(--space-6) var(--space-4)',
            gap: 'var(--space-3)',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success-bg)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={28} />
          </div>

          <h4 style={{ margin: 0, fontSize: 'var(--text-h4)', fontWeight: 600 }}>
            Candidate Created Successfully
          </h4>

          <p style={{ margin: 0, fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}>
            Parsed and created profile for{' '}
            <strong>
              {createdCandidate.firstName} {createdCandidate.lastName}
            </strong>{' '}
            ({createdCandidate.candidateCode}).
          </p>

          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="primary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : parseMutation.isPending ? (
        <AiLoadingState
          title="Parsing Resume with AI..."
          description="Extracting profile, education, skills, and work history. This typically takes 5–10 seconds."
        />
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            marginTop: 'var(--space-2)',
          }}
        >
          {validationError && (
            <Alert variant="error" title="File Error">
              {validationError}
            </Alert>
          )}

          {parseMutation.isError && (
            <Alert variant="error" title="Resume Parsing Failed">
              {parseMutation.error?.message ||
                'Failed to extract candidate credentials from resume. Please verify the PDF format and try again.'}
            </Alert>
          )}

          {/* Upload Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6) var(--space-4)',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-hover)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-2)',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
              aria-label="Upload PDF resume"
            />

            <UploadCloud size={32} style={{ color: 'var(--color-primary)' }} />

            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <FileText size={16} />
                <span>{file.name}</span>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </div>
            ) : (
              <div>
                <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: 'var(--text-body-sm)' }}>
                  Click to browse or drag and drop PDF resume
                </p>
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-muted)' }}>
                  Supported format: PDF only (max 10MB)
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warm-white-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AiBadge size="sm" />
            <span>
              Parsing automatically generates and stores a new Candidate record in your workspace.
            </span>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 'var(--space-3)',
              marginTop: 'var(--space-2)',
            }}
          >
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handleClose}
              disabled={parseMutation.isPending}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={!file || parseMutation.isPending}
            >
              Parse & Create Candidate
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  )
}
