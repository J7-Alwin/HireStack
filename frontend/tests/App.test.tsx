import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { App } from '@/app/App'

describe('App Root Smoke Test', () => {
  it('renders the HireStack ATS foundation screen', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: /HireStack ATS/i })).toBeInTheDocument()
    expect(screen.getByText(/Frontend foundation initialized\./i)).toBeInTheDocument()
  })
})
