import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { OfferCandidate } from '@/features/offers/components/OfferCandidate'
import { OfferApplication } from '@/features/offers/components/OfferApplication'
import { OfferJob } from '@/features/offers/components/OfferJob'

describe('Offer Relationships Links', () => {
  it('renders candidate relationship with link to /app/candidates/:id', () => {
    const candidate = {
      id: 'cand_777',
      candidateCode: 'CAN-000777',
      firstName: 'Carol',
      lastName: 'Danvers',
      email: 'carol@marvel.com',
      phone: '+1-555-0999',
    }

    render(
      <MemoryRouter>
        <OfferCandidate candidate={candidate} />
      </MemoryRouter>
    )

    expect(screen.getByText('Carol Danvers')).toBeInTheDocument()
    expect(screen.getByText('carol@marvel.com')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Candidate/i })
    expect(link).toHaveAttribute('href', '/app/candidates/cand_777')
  })

  it('renders application relationship with link to /app/applications/:id', () => {
    const application = {
      id: 'app_666',
      applicationCode: 'APP-000666',
      stage: 'OFFER',
      status: 'ACTIVE',
      assignedRecruiter: {
        id: 'usr_rec',
        firstName: 'Maria',
        lastName: 'Rambeau',
        email: 'maria@sword.gov',
      },
      candidate: {
        id: 'cand_1',
        firstName: 'Monica',
        lastName: 'Rambeau',
        email: 'monica@sword.gov',
      },
      job: {
        id: 'job_1',
        title: 'Photon Energy Lead',
      },
    }

    render(
      <MemoryRouter>
        <OfferApplication application={application} />
      </MemoryRouter>
    )

    expect(screen.getByText('APP-000666')).toBeInTheDocument()
    expect(screen.getByText('Maria')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Application/i })
    expect(link).toHaveAttribute('href', '/app/applications/app_666')
  })

  it('renders job relationship with link to /app/jobs/:id', () => {
    const job = {
      id: 'job_555',
      jobCode: 'JOB-000555',
      title: 'Principal Astrophysics Researcher',
    }

    render(
      <MemoryRouter>
        <OfferJob job={job} />
      </MemoryRouter>
    )

    expect(screen.getByText('Principal Astrophysics Researcher')).toBeInTheDocument()
    expect(screen.getByText('Requisition Code: JOB-000555')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Job/i })
    expect(link).toHaveAttribute('href', '/app/jobs/job_555')
  })

  it('handles missing relations safely without broken links', () => {
    render(
      <MemoryRouter>
        <OfferCandidate candidate={undefined} />
        <OfferApplication application={undefined} />
        <OfferJob job={undefined} />
      </MemoryRouter>
    )

    expect(screen.getByText('No candidate details available.')).toBeInTheDocument()
    expect(screen.getByText('No application details available.')).toBeInTheDocument()
    expect(screen.getByText('No job requisition details available.')).toBeInTheDocument()
  })
})
