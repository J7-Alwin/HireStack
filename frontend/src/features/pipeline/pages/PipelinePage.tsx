import { useState } from 'react'
import { AtsPageHeader } from '@/components/ats'
import { ErrorState } from '@/components/ui'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { usePipelines, useMovePipelineStage } from '../hooks'
import {
  PipelineFilters,
  PipelineBoard,
  PipelineMoveModal,
  PipelineHistoryDrawer,
} from '../components'
import {
  ACTIVE_PIPELINE_STAGES,
  ALL_PIPELINE_STAGES,
} from '../utils/pipeline-helpers'
import type { Pipeline, PipelineQueryFilters, MoveStageInput } from '../types/pipeline.types'

export function PipelinePage() {
  const { params, setParam, setSearch, resetParams } = useAtsUrlParams<PipelineQueryFilters>({
    defaults: {
      limit: 100,
      active: true,
      sortBy: 'stageOrder',
      sortOrder: 'asc',
    },
  })

  const { data, isLoading, isError, error, refetch } = usePipelines(params)
  const pipelines = data?.data || []

  const [selectedForMove, setSelectedForMove] = useState<Pipeline | null>(null)
  const [selectedForHistory, setSelectedForHistory] = useState<Pipeline | null>(null)

  const moveMutation = useMovePipelineStage(selectedForMove?.id || '')

  const handleMoveConfirm = async (input: MoveStageInput) => {
    if (!selectedForMove) return
    await moveMutation.mutateAsync(input)
  }

  const handleStatusCategoryChange = (statusCat?: 'active' | 'completed' | 'all') => {
    if (statusCat === 'completed') {
      setParam('completed', true)
      setParam('active', undefined)
    } else if (statusCat === 'all') {
      setParam('completed', undefined)
      setParam('active', false)
    } else {
      setParam('completed', undefined)
      setParam('active', true)
    }
  }

  // If filtered by specific stage or completed status, show appropriate columns
  const visibleStages = params.currentStage
    ? [params.currentStage]
    : params.completed || params.active === false
    ? ALL_PIPELINE_STAGES
    : ACTIVE_PIPELINE_STAGES

  return (
    <div
      data-testid="pipeline-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Hiring Pipeline"
        subtitle="Visual recruitment workflow board connecting candidate applications across screening, interview, and offer stages."
      />

      <PipelineFilters
        filters={params}
        onSearchChange={setSearch}
        onJobChange={(jobId) => setParam('jobId', jobId)}
        onStageChange={(stage) => setParam('currentStage', stage)}
        onStatusCategoryChange={handleStatusCategoryChange}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load hiring pipeline"
          description={error?.message || 'An unexpected error occurred while loading pipeline data.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <PipelineBoard
          pipelines={pipelines}
          isLoading={isLoading}
          visibleStages={visibleStages}
          onMove={(p) => setSelectedForMove(p)}
          onViewHistory={(p) => setSelectedForHistory(p)}
        />
      )}

      <PipelineMoveModal
        isOpen={Boolean(selectedForMove)}
        onClose={() => setSelectedForMove(null)}
        pipeline={selectedForMove}
        onConfirm={handleMoveConfirm}
        isLoading={moveMutation.isPending}
      />

      <PipelineHistoryDrawer
        isOpen={Boolean(selectedForHistory)}
        onClose={() => setSelectedForHistory(null)}
        pipeline={selectedForHistory}
      />
    </div>
  )
}
