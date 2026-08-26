import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Topbar } from '@/components/layout/Topbar'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore, useUiStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('Topbar Component', () => {
  const mockUser: AuthUser = {
    id: 'usr_1',
    email: 'admin@company.com',
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_100',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
    useUiStore.getState().resetUiState()
    vi.restoreAllMocks()
  })

  it('renders breadcrumbs, search, notifications, company context, and user menu', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Topbar />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('navigation', { name: /Breadcrumb/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Global search/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Notifications/i })).toBeInTheDocument()
    expect(screen.getByTestId('company-context-tenant')).toBeInTheDocument()
    expect(screen.getByText('admin@company.com')).toBeInTheDocument()
  })

  it('triggers mobile nav toggle when mobile menu button is clicked', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Topbar />
        </AuthProvider>
      </MemoryRouter>
    )

    const mobileMenuButton = screen.getByRole('button', { name: /Open navigation menu/i })
    fireEvent.click(mobileMenuButton)

    expect(useUiStore.getState().isMobileNavOpen).toBe(true)
  })
})
