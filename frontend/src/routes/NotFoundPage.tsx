import { Link } from 'react-router-dom'

/**
 * 404 Not Found Page
 */
export function NotFoundPage() {
  return (
    <main
      role="main"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
        404 — Page Not Found
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#2563eb',
          textDecoration: 'none',
        }}
      >
        Return to Home
      </Link>
    </main>
  )
}
