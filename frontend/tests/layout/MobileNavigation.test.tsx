import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MobileNavigation } from '@/components/layout/MobileNavigation'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore, useUiStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('MobileNavigation Component', () => {
  const mockUser: AuthUser = {
    id: 'usr_rec',
    email: 'recruiter@company.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
    useUiStore.getState().resetUiState()
  })

  it('does not render when isMobileNavOpen is false', () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    useUiStore.getState().setMobileNavOpen(false)

    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNavigation />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.queryByRole('dialog', { name: /Mobile Navigation/i })).not.toBeInTheDocument()
  })

  it('renders drawer when isMobileNavOpen is true', () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    useUiStore.getState().setMobileNavOpen(true)

    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNavigation />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('dialog', { name: /Mobile Navigation/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Close navigation menu/i })).toBeInTheDocument()
  })

  it('closes when close button or backdrop is clicked', () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    useUiStore.getState().setMobileNavOpen(true)

    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNavigation />
        </AuthProvider>
      </MemoryRouter>
    )

    const closeButton = screen.getByRole('button', { name: /Close navigation menu/i })
    fireEvent.click(closeButton)
    expect(useUiStore.getState().isMobileNavOpen).toBe(false)
  })

  it('closes on Escape key press', () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    useUiStore.getState().setMobileNavOpen(true)

    render(
      <MemoryRouter>
        <AuthProvider>
          <MobileNavigation />
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(useUiStore.getState().isMobileNavOpen).toBe(false)
  })
})
