import { useNavigate } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import { Pagination, Button, ErrorState } from '@/components/ui'
import { AtsPageHeader } from '@/components/ats'
import { useAtsUrlParams } from '@/hooks/useAtsUrlParams'
import { useOffers, useDeleteOffer } from '../hooks'
import { OfferTable, OfferFilters } from '../components'
import type { Offer, OfferFilterParams } from '../types/offers.types'

export function OffersPage() {
  const navigate = useNavigate()
  const { params, setParam, setSearch, setPage, resetParams } =
    useAtsUrlParams<OfferFilterParams>({
      defaults: {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      },
    })

  const { data, isLoading, isError, error, refetch } = useOffers(params)
  const deleteMutation = useDeleteOffer()

  const offers = data?.data || []
  const pagination = data?.meta

  const handleView = (item: Offer) => {
    navigate(`/app/offers/${item.id}`)
  }

  const handleEdit = (item: Offer) => {
    navigate(`/app/offers/${item.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id)
  }

  return (
    <div
      data-testid="offers-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        width: '100%',
      }}
    >
      <AtsPageHeader
        title="Offers"
        subtitle="Manage candidate job offers, compensation packages, approvals, and candidate decisions."
        primaryAction={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app/offers/new')}
            iconLeft={<PlusCircle size={16} />}
            aria-label="Create offer"
          >
            Create Offer
          </Button>
        }
      />

      <OfferFilters
        params={params}
        onSearchChange={setSearch}
        onStatusChange={(status) => setParam('status', status)}
        onCurrencyChange={(currency) => setParam('currency', currency)}
        onEmploymentTypeChange={(type) => setParam('employmentType', type)}
        onReset={resetParams}
      />

      {isError ? (
        <ErrorState
          title="Failed to load offers"
          description={error?.message || 'An unexpected error occurred while loading offers.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <OfferTable
            offers={offers}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {pagination && pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
