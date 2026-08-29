import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage'
import { applicationsService } from '@/features/applications/services/applications.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('Application RBAC Guards', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('blocks CANDIDATE role from accessing ApplicationsPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_cand',
      email: 'candidate@domain.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/applications']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/applications"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByText('Applications')).not.toBeInTheDocument()
    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
  })

  it('allows RECRUITER role to access ApplicationsPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })
    vi.spyOn(applicationsService, 'listApplications').mockResolvedValueOnce({
      data: [],
      meta: { total: 0, totalPages: 0, page: 1, limit: 10 },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/applications']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/applications"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Applications')).toBeInTheDocument()
  })
})
