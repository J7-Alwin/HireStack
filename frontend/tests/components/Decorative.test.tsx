import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  DecorativeCurve,
  DecorativeCircle,
  DecorativeDot,
  DecorativeSpark,
} from '@/components/ui/decorative'

describe('Decorative Components', () => {
  it('renders decorative components with aria-hidden="true"', () => {
    const { container: c1 } = render(<DecorativeCurve />)
    expect(c1.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')

    const { container: c2 } = render(<DecorativeCircle />)
    expect(c2.firstChild).toHaveAttribute('aria-hidden', 'true')

    const { container: c3 } = render(<DecorativeDot />)
    expect(c3.firstChild).toHaveAttribute('aria-hidden', 'true')

    const { container: c4 } = render(<DecorativeSpark />)
    expect(c4.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
