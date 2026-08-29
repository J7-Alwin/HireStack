import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ApiClient } from '@/services/api/api-client'
import { ApiError } from '@/services/api/api-error'
import { useAuthStore } from '@/stores'
import { authTokenStorage } from '@/services/auth/auth-token.storage'
import { queryClient } from '@/services/api'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'
import { AtsConfirmDialog } from '@/components/ats/AtsConfirmDialog'
import { Button } from '@/components/ui'
import { Role, AccountStatus } from '@/types'

describe('Stage 10: Production Readiness, Security & QA Hardening Suite', () => {
  const originalFetch = globalThis.fetch
  let client: ApiClient

  beforeEach(() => {
    client = new ApiClient({ baseUrl: 'http://localhost:5000/api/v1' })
    useAuthStore.getState().reset()
    authTokenStorage.clearTokens()
    queryClient.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('1. API Client HTTP Error Status Code Matrix & Network Resiliency', () => {
    const errorStatuses = [
      { status: 400, expectedStatus: 400, isValidation: true, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: false },
      { status: 401, expectedStatus: 401, isValidation: false, isUnauthorized: true, isForbidden: false, isNotFound: false, isServer: false },
      { status: 403, expectedStatus: 403, isValidation: false, isUnauthorized: false, isForbidden: true, isNotFound: false, isServer: false },
      { status: 404, expectedStatus: 404, isValidation: false, isUnauthorized: false, isForbidden: false, isNotFound: true, isServer: false },
      { status: 409, expectedStatus: 409, isValidation: false, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: false },
      { status: 422, expectedStatus: 422, isValidation: true, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: false },
      { status: 429, expectedStatus: 429, isValidation: false, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: false },
      { status: 500, expectedStatus: 500, isValidation: false, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: true },
      { status: 503, expectedStatus: 503, isValidation: false, isUnauthorized: false, isForbidden: false, isNotFound: false, isServer: true },
    ]

    for (const testCase of errorStatuses) {
      it(`correctly categorizes HTTP ${testCase.status} response into ApiError`, async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: testCase.status,
          headers: new Headers({
            'content-type': 'application/json',
            'x-request-id': `req-err-${testCase.status}`,
          }),
          json: async () => ({
            success: false,
            message: `HTTP Error ${testCase.status}`,
            errors: testCase.isValidation ? [{ field: 'code', message: 'Invalid payload' }] : undefined,
          }),
        })

        try {
          await client.get('/test-endpoint')
          expect.fail(`Expected HTTP ${testCase.status} to throw ApiError`)
        } catch (err) {
          expect(err).toBeInstanceOf(ApiError)
          const apiErr = err as ApiError
          expect(apiErr.status).toBe(testCase.expectedStatus)
          expect(apiErr.isValidationError).toBe(testCase.isValidation)
          expect(apiErr.isUnauthorized).toBe(testCase.isUnauthorized)
          expect(apiErr.isForbidden).toBe(testCase.isForbidden)
          expect(apiErr.isNotFound).toBe(testCase.isNotFound)
          expect(apiErr.isServerError).toBe(testCase.isServer)
          expect(apiErr.requestId).toBe(`req-err-${testCase.status}`)
        }
      })
    }

    it('handles HTTP 204 No Content gracefully returning null data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        headers: new Headers(),
        text: async () => '',
      })

      const res = await client.delete('/candidates/cand-123')
      expect(res.success).toBe(true)
      expect(res.data).toBeNull()
    })

    it('normalizes unhandled network failure / TypeError into ApiError with NETWORK_ERROR code', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

      try {
        await client.get('/jobs')
        expect.fail('Expected network error to throw')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        const apiErr = err as ApiError
        expect(apiErr.status).toBe(0)
        expect(apiErr.isNetworkError).toBe(true)
        expect(apiErr.code).toBe('NETWORK_ERROR')
      }
    })

    it('handles non-JSON error responses without crashing JSON parser', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body>Bad Gateway</body></html>',
      })

      try {
        await client.get('/applications')
        expect.fail('Expected 502 to throw')
      } catch (err) {
        expect(err).toBeInstanceOf(ApiError)
        const apiErr = err as ApiError
        expect(apiErr.status).toBe(502)
        expect(apiErr.isServerError).toBe(true)
      }
    })
  })

  describe('2. Security & Session Expiration Lifecycle', () => {
    it('clears access tokens and resets auth store on unauthorized 401 callback', () => {
      authTokenStorage.setTokens({
        accessToken: 'valid-jwt-token-123',
        refreshToken: 'valid-refresh-token-456',
      })
      expect(authTokenStorage.hasTokens()).toBe(true)

      useAuthStore.getState().setAuthenticated({
        id: 'usr-123',
        email: 'recruiter@hirestack.io',
        role: Role.RECRUITER,
        status: AccountStatus.ACTIVE,
        companyId: 'comp-123',
      })
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      // Simulate token provider invoking onUnauthorized
      authTokenStorage.clearTokens()
      queryClient.clear()
      useAuthStore.getState().setUnauthenticated()

      expect(authTokenStorage.hasTokens()).toBe(false)
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().user).toBeNull()
      expect(useAuthStore.getState().status).toBe('UNAUTHENTICATED')
    })
  })

  describe('3. Destructive Action Safety & Confirmation Dialogs', () => {
    it('disables cancel and confirm buttons during destructive mutation execution', () => {
      const onConfirm = vi.fn()
      const onClose = vi.fn()

      const { rerender } = render(
        <AtsConfirmDialog
          isOpen={true}
          title="Delete Candidate Record"
          description="Are you sure you want to permanently delete this candidate?"
          confirmLabel="Delete"
          variant="danger"
          isLoading={false}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      )

      const confirmBtn = screen.getByRole('button', { name: 'Delete' })
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' })

      expect(confirmBtn).not.toBeDisabled()
      expect(cancelBtn).not.toBeDisabled()

      // When loading is true during API mutation
      rerender(
        <AtsConfirmDialog
          isOpen={true}
          title="Delete Candidate Record"
          description="Are you sure you want to permanently delete this candidate?"
          confirmLabel="Delete"
          variant="danger"
          isLoading={true}
          onConfirm={onConfirm}
          onClose={onClose}
        />
      )

      expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
    })
  })

  describe('4. Form Double Submission & Loading Safety', () => {
    it('Button component automatically sets disabled and aria-busy when isLoading is true', () => {
      const handleClick = vi.fn()

      const { rerender } = render(
        <Button onClick={handleClick} isLoading={false}>
          Submit Application
        </Button>
      )

      const btn = screen.getByRole('button', { name: 'Submit Application' })
      expect(btn).not.toBeDisabled()
      expect(btn).toHaveAttribute('aria-busy', 'false')

      fireEvent.click(btn)
      expect(handleClick).toHaveBeenCalledTimes(1)

      // Set loading state (e.g. during pending mutation)
      rerender(
        <Button onClick={handleClick} isLoading={true}>
          Submit Application
        </Button>
      )

      expect(btn).toBeDisabled()
      expect(btn).toHaveAttribute('aria-busy', 'true')
      expect(btn).toHaveAttribute('aria-disabled', 'true')

      // Click while loading should not trigger callback
      fireEvent.click(btn)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('5. Error Boundary Resilience', () => {
    const ProblematicChild = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('Simulated runtime render crash')
      }
      return <div>Normal Content Rendering</div>
    }

    it('catches runtime child crashes and provides Try Again recovery action', async () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ProblematicChild shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(
        screen.getByText(/An unexpected error occurred while rendering this page/i)
      ).toBeInTheDocument()

      const tryAgainBtn = screen.getByRole('button', { name: /Try Again/i })
      expect(tryAgainBtn).toBeInTheDocument()

      // Resolve problem and trigger recovery
      rerender(
        <ErrorBoundary>
          <ProblematicChild shouldThrow={false} />
        </ErrorBoundary>
      )

      fireEvent.click(tryAgainBtn)

      await waitFor(() => {
        expect(screen.getByText('Normal Content Rendering')).toBeInTheDocument()
      })
    })
  })
})
