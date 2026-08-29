import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { JobsPage } from '@/features/jobs/pages/JobsPage'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus } from '@/types'

describe('Job RBAC Guards', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
    vi.spyOn(jobsService, 'getDepartmentOptions').mockResolvedValue([])
  })

  it('blocks CANDIDATE role from accessing JobsPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_cand',
      email: 'candidate@domain.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/jobs']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/jobs"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <JobsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.queryByText('Jobs')).not.toBeInTheDocument()
    expect(screen.getByText('Access Restricted')).toBeInTheDocument()
  })

  it('allows RECRUITER role to access JobsPage', () => {
    useAuthStore.getState().setAuthenticated({
      id: 'usr_rec',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/app/jobs']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/app/jobs"
                element={
                  <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
                    <JobsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(screen.getByText('Jobs')).toBeInTheDocument()
  })
})
