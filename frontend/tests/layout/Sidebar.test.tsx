import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore, useUiStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('Sidebar Component', () => {
  const recruiterUser: AuthUser = {
    id: 'usr_1',
    email: 'recruiter@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
    useUiStore.getState().resetUiState()
    vi.restoreAllMocks()
  })

  it('renders branding and role-appropriate navigation items', () => {
    useAuthStore.getState().setAuthenticated(recruiterUser)

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Sidebar />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('HireStack')).toBeInTheDocument()
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Candidates')).toBeInTheDocument()
    expect(screen.getByText('Jobs')).toBeInTheDocument()
    expect(screen.queryByText('Team Members')).not.toBeInTheDocument()
  })

  it('toggles collapse state when collapse button is clicked', () => {
    useAuthStore.getState().setAuthenticated(recruiterUser)

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Sidebar />
        </AuthProvider>
      </MemoryRouter>
    )

    const collapseButton = screen.getByRole('button', { name: /Collapse sidebar/i })
    fireEvent.click(collapseButton)

    expect(useUiStore.getState().isSidebarCollapsed).toBe(true)

    // In collapsed state, branding text is hidden
    expect(screen.queryByText('HireStack')).not.toBeInTheDocument()

    // Expand button is present
    const expandButton = screen.getByRole('button', { name: /Expand sidebar/i })
    fireEvent.click(expandButton)

    expect(useUiStore.getState().isSidebarCollapsed).toBe(false)
    expect(screen.getByText('HireStack')).toBeInTheDocument()
  })
})
