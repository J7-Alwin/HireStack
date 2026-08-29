import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { CandidatesPage } from '@/features/candidates/pages/CandidatesPage'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('Candidate RBAC Guards', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('blocks CANDIDATE role from accessing CandidatesPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_cand',
      email: 'candidate@domain.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/candidates']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/candidates"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <CandidatesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByText('Candidates')).not.toBeInTheDocument()
    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
  })

  it('allows RECRUITER role to access CandidatesPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/candidates']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/candidates"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <CandidatesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Candidates')).toBeInTheDocument()
  })
})
