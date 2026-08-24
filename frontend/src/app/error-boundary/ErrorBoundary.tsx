import { Component, type ErrorInfo, type ReactNode } from 'react'

export type FallbackRender = (error: Error, reset: () => void) => ReactNode

export interface ErrorBoundaryProps {
  readonly children: ReactNode
  readonly fallback?: ReactNode | FallbackRender
}

interface ErrorBoundaryState {
  readonly hasError: boolean
  readonly error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Error logged for development debugging
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary caught error]:', error, errorInfo)
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      const { fallback } = this.props

      if (typeof fallback === 'function') {
        return this.state.error ? fallback(this.state.error, this.handleReset) : null
      }

      if (fallback) {
        return fallback
      }

      return (
        <main
          role="alert"
          aria-live="assertive"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: '#1f2937',
            backgroundColor: '#f9fafb',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '32px',
              textAlign: 'center',
              border: '1px solid #e5e7eb',
            }}
          >
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#111827',
                margin: '0 0 12px 0',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: '#4b5563',
                margin: '0 0 24px 0',
                lineHeight: 1.5,
              }}
            >
              An unexpected error occurred while rendering this page. You can try refreshing the page or attempting the action again.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#ffffff',
                  backgroundColor: '#2563eb',
                  border: '1px solid #2563eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </main>
      )
    }

    return this.props.children
  }
}
