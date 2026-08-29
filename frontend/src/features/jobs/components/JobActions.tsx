import { Button } from '@/components/ui'
import {
  usePublishJob,
  useOpenJob,
  usePauseJob,
  useReopenJob,
  useCloseJob,
  useArchiveJob,
} from '../hooks'
import type { Job } from '../types/jobs.types'
import { Play, Pause, CheckCircle, Archive, Send } from 'lucide-react'

export interface JobActionsProps {
  readonly job: Job
}

export function JobActions({ job }: JobActionsProps) {
  const publishMutation = usePublishJob()
  const openMutation = useOpenJob()
  const pauseMutation = usePauseJob()
  const reopenMutation = useReopenJob()
  const closeMutation = useCloseJob()
  const archiveMutation = useArchiveJob()

  const isPending =
    publishMutation.isPending ||
    openMutation.isPending ||
    pauseMutation.isPending ||
    reopenMutation.isPending ||
    closeMutation.isPending ||
    archiveMutation.isPending

  switch (job.status) {
    case 'DRAFT':
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => void openMutation.mutate(job.id)}
            isLoading={openMutation.isPending}
            disabled={isPending}
            iconLeft={<Play size={14} />}
          >
            Open Job
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void publishMutation.mutate(job.id)}
            isLoading={publishMutation.isPending}
            disabled={isPending}
            iconLeft={<Send size={14} />}
          >
            Publish Draft
          </Button>
        </div>
      )

    case 'PUBLISHED':
      return (
        <Button
          variant="primary"
          size="md"
          onClick={() => void openMutation.mutate(job.id)}
          isLoading={openMutation.isPending}
          disabled={isPending}
          iconLeft={<Play size={14} />}
        >
          Open Requisition
        </Button>
      )

    case 'OPEN':
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => void pauseMutation.mutate(job.id)}
            isLoading={pauseMutation.isPending}
            disabled={isPending}
            iconLeft={<Pause size={14} />}
          >
            Pause Job
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void closeMutation.mutate(job.id)}
            isLoading={closeMutation.isPending}
            disabled={isPending}
            iconLeft={<CheckCircle size={14} />}
          >
            Close Job
          </Button>
        </div>
      )

    case 'PAUSED':
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => void reopenMutation.mutate(job.id)}
            isLoading={reopenMutation.isPending}
            disabled={isPending}
            iconLeft={<Play size={14} />}
          >
            Reopen Job
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => void closeMutation.mutate(job.id)}
            isLoading={closeMutation.isPending}
            disabled={isPending}
            iconLeft={<CheckCircle size={14} />}
          >
            Close Job
          </Button>
        </div>
      )

    case 'CLOSED':
      return (
        <Button
          variant="outline"
          size="md"
          onClick={() => void archiveMutation.mutate(job.id)}
          isLoading={archiveMutation.isPending}
          disabled={isPending}
          iconLeft={<Archive size={14} />}
        >
          Archive Job
        </Button>
      )

    case 'ARCHIVED':
    default:
      return null
  }
}
