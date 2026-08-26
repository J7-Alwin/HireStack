import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompanyContext } from '@/components/layout/CompanyContext'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { useAuthStore } from '@/stores'
import { Role, AccountStatus, type AuthUser } from '@/types'

describe('CompanyContext Component', () => {
  beforeEach(() => {
    useAuthStore.getState().reset()
  })

  it('renders Platform Admin badge for SUPER_ADMIN', () => {
    const superAdmin: AuthUser = {
      id: '1',
      email: 'admin@hirestack.com',
      role: Role.SUPER_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }
    useAuthStore.getState().setAuthenticated(superAdmin)

    render(
      <AuthProvider>
        <CompanyContext />
      </AuthProvider>
    )

    expect(screen.getByTestId('company-context-platform')).toBeInTheDocument()
    expect(screen.getByText('Platform Admin')).toBeInTheDocument()
  })

  it('renders Company Workspace badge for COMPANY_ADMIN', () => {
    const companyAdmin: AuthUser = {
      id: '2',
      email: 'admin@acme.com',
      role: Role.COMPANY_ADMIN,
      status: AccountStatus.ACTIVE,
      companyId: 'acme_corp',
    }
    useAuthStore.getState().setAuthenticated(companyAdmin)

    render(
      <AuthProvider>
        <CompanyContext />
      </AuthProvider>
    )

    expect(screen.getByTestId('company-context-tenant')).toBeInTheDocument()
    expect(screen.getByText(/acme_corp/)).toBeInTheDocument()
  })

  it('renders Candidate Portal badge for CANDIDATE', () => {
    const candidate: AuthUser = {
      id: '3',
      email: 'cand@gmail.com',
      role: Role.CANDIDATE,
      status: AccountStatus.ACTIVE,
      companyId: null,
    }
    useAuthStore.getState().setAuthenticated(candidate)

    render(
      <AuthProvider>
        <CompanyContext />
      </AuthProvider>
    )

    expect(screen.getByTestId('company-context-candidate')).toBeInTheDocument()
    expect(screen.getByText('Candidate Portal')).toBeInTheDocument()
  })
})
