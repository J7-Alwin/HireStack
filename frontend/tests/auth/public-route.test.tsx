import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { PublicRoute } from '@/routes/PublicRoute'
import { useAuthStore } from '@/stores/auth.store'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { authTokenStorage } from '@/services/auth/auth-token.storage'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('PublicRoute', () => {
  const mockUser: AuthUser = {
    id: 'usr_1',
    email: 'user@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    authTokenStorage.clearTokens()
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders login page when user is unauthenticated', () => {
    useAuthStore.getState().setUnauthenticated()

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div>Public Login Screen</div>
                </PublicRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Public Login Screen')).toBeInTheDocument()
  })

  it('redirects authenticated users away from login', () => {
    useAuthStore.getState().setAuthenticated(mockUser)

    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <div>Public Login Screen</div>
                </PublicRoute>
              }
            />
            <Route path="/" element={<div>Dashboard Root</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.queryByText('Public Login Screen')).not.toBeInTheDocument()
    expect(screen.getByText('Dashboard Root')).toBeInTheDocument()
  })
})
