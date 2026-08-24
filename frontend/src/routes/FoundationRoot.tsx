/**
 * Root Foundation Screen (Development Placeholder)
 * Will be replaced in Stage 4 & Stage 5 with actual routes and authenticated shells.
 */
export function FoundationRoot() {
  return (
    <main
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
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          padding: '40px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#111827',
            margin: '0 0 12px 0',
            letterSpacing: '-0.025em',
          }}
        >
          HireStack ATS
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: '#4b5563',
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Frontend foundation initialized.
        </p>
      </div>
    </main>
  )
}
