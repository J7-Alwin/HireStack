import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { useAuthStore } from '@/stores/auth.store'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { authService, authTokenStorage } from '@/services/auth'
import { Role, AccountStatus, type AuthUser } from '@/types'


describe('ProtectedRoute', () => {
  const recruiterUser: AuthUser = {
    id: 'usr_1',
    email: 'recruiter@hirestack.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    authTokenStorage.clearTokens()
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders loading state while initializing', () => {
    authTokenStorage.setTokens({ accessToken: 'token_a', refreshToken: 'token_b' })
    // Keep restoreSession pending
    vi.spyOn(authService, 'getCurrentUser').mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret ATS Data</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByTestId('auth-loading-state')).toBeInTheDocument()
    expect(screen.queryByText('Secret ATS Data')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to /login', async () => {
    useAuthStore.getState().setUnauthenticated()

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <div>Secret ATS Data</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret ATS Data')).not.toBeInTheDocument()
  })

  it('allows authorized users to access protected content', () => {
    useAuthStore.getState().setAuthenticated(recruiterUser)

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute allowedRoles={[Role.RECRUITER, Role.COMPANY_ADMIN]}>
                  <div>Secret ATS Data</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Secret ATS Data')).toBeInTheDocument()
  })

  it('renders ForbiddenPage when user lacks required role', () => {
    useAuthStore.getState().setAuthenticated({
      ...recruiterUser,
      role: Role.CANDIDATE,
    })

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/protected"
              element={
                <ProtectedRoute allowedRoles={[Role.SUPER_ADMIN]}>
                  <div>Super Admin Panel</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByText(/Access Restricted/i)).toBeInTheDocument()
    expect(screen.queryByText('Super Admin Panel')).not.toBeInTheDocument()
  })

})
