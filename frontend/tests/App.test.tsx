import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from '@/app/App'

describe('App Root Smoke Test', () => {
  it('renders the HireStack ATS public landing page', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: /HireStack ATS/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Unified candidate intelligence, requisition planning/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Open ATS Workspace/i })).toBeInTheDocument()
  })
})

