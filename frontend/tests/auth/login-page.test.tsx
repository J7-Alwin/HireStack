import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { authService, authTokenStorage } from '@/services/auth'
import { useAuthStore } from '@/stores/auth.store'
import { Role, AccountStatus, type LoginResponseData } from '@/types'

describe('LoginPage Component', () => {
  const mockLoginData: LoginResponseData = {
    user: {
      id: 'usr_1',
      email: 'recruiter@hirestack.com',
      role: Role.RECRUITER,
      status: AccountStatus.ACTIVE,
      companyId: 'comp_1',
    },
    accessToken: 'access_123',
    refreshToken: 'refresh_456',
  }

  beforeEach(() => {
    authTokenStorage.clearTokens()
    useAuthStore.getState().reset()
    vi.restoreAllMocks()
  })

  it('renders login form and inputs correctly', () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { level: 1, name: /HireStack/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i, { selector: 'input' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('validates required fields before submitting', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    const submitButton = screen.getByRole('button', { name: /Sign In/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/Email is required/i)).toBeInTheDocument()
    })
  })

  it('handles successful login submission', async () => {
    vi.spyOn(authService, 'login').mockResolvedValueOnce(mockLoginData)

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'recruiter@hirestack.com' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: 'input' }), {
      target: { value: 'ValidPassword@123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'recruiter@hirestack.com',
        password: 'ValidPassword@123',
      })
    })
  })

  it('displays authentication error banner upon failure', async () => {
    vi.spyOn(authService, 'login').mockRejectedValueOnce(
      new Error('Invalid email or password')
    )

    render(
      <MemoryRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Email address/i), {
      target: { value: 'recruiter@hirestack.com' },
    })
    fireEvent.change(screen.getByLabelText(/Password/i, { selector: 'input' }), {
      target: { value: 'WrongPassword' },
    })



    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument()
    })
  })
})
