import type { BadgeVariant } from '@/components/ui'
import type {
  HiringRecommendationType,
  ResumeRecommendationPriority,
  InterviewDifficulty,
} from '../types'

export const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB as defined in backend multer

export function validateResumeFile(file: File | null | undefined): {
  readonly isValid: boolean
  readonly error?: string
} {
  if (!file) {
    return { isValid: false, error: 'Please select a resume file to upload.' }
  }

  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    return {
      isValid: false,
      error: 'Only PDF format (.pdf) resume files are supported.',
    }
  }

  if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'Resume file size exceeds the 10MB limit.',
    }
  }

  if (file.size === 0) {
    return {
      isValid: false,
      error: 'Selected resume file is empty.',
    }
  }

  return { isValid: true }
}

export function getScoreVariant(score: number): BadgeVariant {
  if (score >= 80) return 'success'
  if (score >= 65) return 'info'
  if (score >= 45) return 'warning'
  return 'error'
}

export function getRecommendationVariant(
  rec?: HiringRecommendationType | string | null
): BadgeVariant {
  switch (rec) {
    case 'STRONGLY_RECOMMENDED':
    case 'RECOMMENDED':
      return 'success'
    case 'CONSIDER':
      return 'warning'
    case 'NOT_RECOMMENDED':
      return 'error'
    default:
      return 'neutral'
  }
}

export function getRecommendationLabel(
  rec?: HiringRecommendationType | string | null
): string {
  switch (rec) {
    case 'STRONGLY_RECOMMENDED':
      return 'Strongly Recommended'
    case 'RECOMMENDED':
      return 'Recommended'
    case 'CONSIDER':
      return 'Consider with Reservations'
    case 'NOT_RECOMMENDED':
      return 'Not Recommended'
    default:
      return rec ? String(rec) : 'Evaluated'
  }
}

export function getPriorityVariant(
  priority?: ResumeRecommendationPriority | string
): BadgeVariant {
  switch (priority) {
    case 'HIGH':
      return 'error'
    case 'MEDIUM':
      return 'warning'
    case 'LOW':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function getDifficultyVariant(
  difficulty?: InterviewDifficulty | string
): BadgeVariant {
  switch (difficulty) {
    case 'HARD':
      return 'error'
    case 'MEDIUM':
      return 'warning'
    case 'EASY':
      return 'success'
    default:
      return 'neutral'
  }
}
