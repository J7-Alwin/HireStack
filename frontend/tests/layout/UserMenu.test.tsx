import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { UserMenu } from '@/components/layout/UserMenu'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('UserMenu Component', () => {
  const mockUser: AuthUser = {
    id: 'usr_admin',
    email: 'admin@company.com',
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders user button and opens dropdown menu on click', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    render(
      <MemoryRouter>
        <AuthProvider>
          <UserMenu />
        </AuthProvider>
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button', { name: /User account menu/i })
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('admin@company.com')).toBeInTheDocument()

    fireEvent.click(trigger)

    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getByText('Company Admin')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: /Sign Out/i })).toBeInTheDocument()
  })

  it('executes logout flow when Sign Out is clicked', async () => {
    useAuthStore.getState().setAuthenticated(mockUser)
    vi.spyOn(authService, 'logout').mockResolvedValueOnce()

    render(
      <MemoryRouter>
        <AuthProvider>
          <UserMenu />
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /User account menu/i }))
    fireEvent.click(screen.getByRole('menuitem', { name: /Sign Out/i }))

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
