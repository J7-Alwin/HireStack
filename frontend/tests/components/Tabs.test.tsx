import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Tabs } from '@/components/ui/tabs'

describe('Tabs Component', () => {
  const tabItems = [
    { id: 'overview', label: 'Overview', content: <div>Overview Content</div> },
    { id: 'pipeline', label: 'Pipeline', content: <div>Pipeline Content</div> },
    { id: 'analytics', label: 'Analytics', content: <div>Analytics Content</div> },
  ]

  it('renders tab buttons and displays initial active panel', () => {
    render(<Tabs items={tabItems} defaultTabId="overview" />)

    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Overview Content')).toBeInTheDocument()
  })

  it('switches content when clicking another tab', () => {
    const handleChange = vi.fn()
    render(<Tabs items={tabItems} defaultTabId="overview" onChange={handleChange} />)

    const pipelineTab = screen.getByRole('tab', { name: /pipeline/i })
    fireEvent.click(pipelineTab)

    expect(pipelineTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('Pipeline Content')).toBeInTheDocument()
    expect(screen.queryByText('Overview Content')).not.toBeInTheDocument()
    expect(handleChange).toHaveBeenCalledWith('pipeline')
  })

  it('supports keyboard navigation arrow keys', () => {
    render(<Tabs items={tabItems} defaultTabId="overview" />)

    const overviewTab = screen.getByRole('tab', { name: /overview/i })
    fireEvent.keyDown(overviewTab, { key: 'ArrowRight' })

    expect(screen.getByText('Pipeline Content')).toBeInTheDocument()
  })
})
