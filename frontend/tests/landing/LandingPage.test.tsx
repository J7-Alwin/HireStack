import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LandingPage } from '@/features/landing/LandingPage'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('Public Landing Page & Marketing Journey', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders complete public landing page with branding, hero, and features', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    // Header branding
    expect(screen.getByText('HireStack')).toBeInTheDocument()
    expect(screen.getByText('ATS Platform')).toBeInTheDocument()

    // Hero title and value proposition
    expect(
      screen.getByRole('heading', { level: 1, name: /HireStack ATS — Intelligent Recruitment Infrastructure/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Unified candidate intelligence, requisition planning/i)
    ).toBeInTheDocument()

    // Core ATS capabilities
    expect(screen.getByText('Candidate Intelligence')).toBeInTheDocument()
    expect(screen.getByText('Job Requisitions')).toBeInTheDocument()
    expect(screen.getByText('Structured Applications')).toBeInTheDocument()
    expect(screen.getByText('Interview Coordination')).toBeInTheDocument()
    expect(screen.getByText('Offer Management')).toBeInTheDocument()
    expect(screen.getByText('Interactive Kanban Pipeline')).toBeInTheDocument()

    // AI trust and decision-support guarantee
    expect(
      screen.getByRole('heading', { level: 2, name: /Advisory Intelligence\. Human Decision Authority\./i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Strict AI Trust & Privacy Guarantee/i)
    ).toBeInTheDocument()

    // Security & RBAC section
    expect(
      screen.getByRole('heading', { level: 2, name: /Security, Privacy & Deterministic RBAC/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Bearer Token Security')).toBeInTheDocument()
    expect(screen.getByText('Role-Based Access')).toBeInTheDocument()
    expect(screen.getByText('Tenant Isolation')).toBeInTheDocument()

    // Footer
    expect(screen.getByText(/All Systems Operational/i)).toBeInTheDocument()
    expect(screen.getByText(/V1\.0 Production/i)).toBeInTheDocument()
  })

  it('renders Sign In and Launch App CTAs for unauthenticated visitors', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const signInButtons = screen.getAllByRole('button', { name: /Sign In/i })
    expect(signInButtons.length).toBeGreaterThanOrEqual(1)

    const launchButton = screen.getByRole('button', { name: /Launch App/i })
    expect(launchButton).toBeInTheDocument()
  })

  it('renders Go to Workspace CTA when user is authenticated', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr-1',
      email: 'recruiter@hirestack.io',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp-1',
    })

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /Go to Workspace/i })).toBeInTheDocument()
  })

  it('toggles mobile navigation menu when toggle button is clicked', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    )

    const toggleBtn = screen.getByRole('button', { name: /Toggle navigation menu/i })
    expect(toggleBtn).toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.getByRole('button', { name: /^Sign In to ATS$/i })).toBeInTheDocument()

    fireEvent.click(toggleBtn)
    expect(screen.queryByRole('button', { name: /^Sign In to ATS$/i })).not.toBeInTheDocument()
  })
})
