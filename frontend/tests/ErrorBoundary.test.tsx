import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBoundary } from '@/app/error-boundary/ErrorBoundary'

function ProblemChild(): React.JSX.Element {
  throw new Error('Test crash')
}

function SafeChild() {
  return <div>Safe child content</div>
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <SafeChild />
      </ErrorBoundary>
    )

    expect(screen.getByText('Safe child content')).toBeInTheDocument()
  })

  it('renders fallback error UI when child throws', () => {
    // Suppress console.error in tests for expected thrown error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()

    consoleSpy.mockRestore()
  })
})
