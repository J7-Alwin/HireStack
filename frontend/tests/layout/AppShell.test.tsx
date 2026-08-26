import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { PageContainer } from '@/components/layout/PageContainer'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('AppShell Integration', () => {
  const recruiterUser: AuthUser = {
    id: 'usr_1',
    email: 'recruiter@company.com',
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: 'comp_1',
  }

  beforeEach(() => {
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders Sidebar, Topbar, and protected children within AppShell', () => {
    useAuthStore.getState().setAuthenticated(recruiterUser)

    render(
      <MemoryRouter initialEntries={['/app']}>
        <AuthProvider>
          <Routes>
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route
                index
                element={
                  <PageContainer>
                    <div data-testid="dashboard-content">ATS Dashboard View</div>
                  </PageContainer>
                }
              />
            </Route>
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    )

    // Sidebar is present
    expect(screen.getByRole('complementary', { name: /Sidebar/i })).toBeInTheDocument()
    // Topbar header is present
    expect(screen.getByRole('banner', { name: /Application Header/i })).toBeInTheDocument()
    // Child page content is rendered
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument()
    expect(screen.getByText('ATS Dashboard View')).toBeInTheDocument()
  })
})
