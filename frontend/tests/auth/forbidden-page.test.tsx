import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ForbiddenPage } from '@/routes/ForbiddenPage'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores/auth.store'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('ForbiddenPage Component', () => {
  const mockUser: AuthUser = {
    id: 'usr_cand',
    email: 'candidate@hirestack.com',
    role: Role.CANDIDATE,
    status: AccountStatus.ACTIVE,
    companyId: null,
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  it('renders 403 Forbidden message and user details', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    render(
      <MemoryRouter>
        <AuthProvider>
          <ForbiddenPage />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument()
    expect(screen.getByText(/candidate@hirestack\.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Return Home/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Go Back/i })).toBeInTheDocument()
  })
})
