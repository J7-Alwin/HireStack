import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { InterviewCandidate } from '@/features/interviews/components/InterviewCandidate'
import { InterviewApplication } from '@/features/interviews/components/InterviewApplication'
import { InterviewJob } from '@/features/interviews/components/InterviewJob'

describe('Interview Relationships Links', () => {
  it('renders candidate relationship with link to /app/candidates/:id', () => {
    const candidate = {
      id: 'cand_999',
      candidateCode: 'CAN-000999',
      firstName: 'Natasha',
      lastName: 'Romanoff',
      email: 'natasha@avengers.org',
    }

    render(
      <MemoryRouter>
        <InterviewCandidate candidate={candidate} />
      </MemoryRouter>
    )

    expect(screen.getByText('Natasha Romanoff')).toBeInTheDocument()
    expect(screen.getByText('natasha@avengers.org')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Candidate/i })
    expect(link).toHaveAttribute('href', '/app/candidates/cand_999')
  })

  it('renders application relationship with link to /app/applications/:id', () => {
    const application = {
      id: 'app_888',
      applicationCode: 'APP-000888',
      stage: 'HR_INTERVIEW',
      status: 'ACTIVE',
      assignedRecruiter: {
        id: 'usr_rec',
        firstName: 'Nick',
        lastName: 'Fury',
        email: 'fury@shield.gov',
      },
      candidate: {
        id: 'cand_1',
        firstName: 'Tony',
        lastName: 'Stark',
        email: 'tony@stark.com',
      },
      job: {
        id: 'job_1',
        title: 'Lead Robotics Engineer',
      },
    }

    render(
      <MemoryRouter>
        <InterviewApplication application={application} />
      </MemoryRouter>
    )

    expect(screen.getByText('APP-000888')).toBeInTheDocument()
    expect(screen.getByText('Nick')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Application/i })
    expect(link).toHaveAttribute('href', '/app/applications/app_888')
  })

  it('renders job relationship with link to /app/jobs/:id', () => {
    const job = {
      id: 'job_777',
      jobCode: 'JOB-000777',
      title: 'Principal AI Researcher',
    }

    render(
      <MemoryRouter>
        <InterviewJob job={job} />
      </MemoryRouter>
    )

    expect(screen.getByText('Principal AI Researcher')).toBeInTheDocument()
    expect(screen.getByText('Requisition Code: JOB-000777')).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /View Job/i })
    expect(link).toHaveAttribute('href', '/app/jobs/job_777')
  })

  it('handles missing relations safely without broken links', () => {
    render(
      <MemoryRouter>
        <InterviewCandidate candidate={undefined} />
        <InterviewApplication application={undefined} />
        <InterviewJob job={undefined} />
      </MemoryRouter>
    )

    expect(screen.getByText('No candidate details available.')).toBeInTheDocument()
    expect(screen.getByText('No application details available.')).toBeInTheDocument()
    expect(screen.getByText('No job details available.')).toBeInTheDocument()
  })
})
