import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DataTable, type ColumnDef } from '@/components/ui/data-table'

interface TestUser {
  id: string
  name: string
  role: string
  status: string
}

describe('DataTable Component', () => {
  const columns: ColumnDef<TestUser>[] = [
    { id: 'name', header: 'Name', accessor: 'name' },
    { id: 'role', header: 'Role', accessor: 'role' },
    {
      id: 'status',
      header: 'Status',
      cell: (item) => <span data-testid="status-cell">{item.status}</span>,
    },
  ]

  const mockData: TestUser[] = [
    { id: '1', name: 'Alice Smith', role: 'Software Engineer', status: 'Active' },
    { id: '2', name: 'Bob Jones', role: 'Product Manager', status: 'Pending' },
  ]

  it('renders headers and table rows correctly', () => {
    render(
      <DataTable
        data={mockData}
        columns={columns}
        keyExtractor={(item) => item.id}
      />
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()

    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
    expect(screen.getAllByTestId('status-cell')).toHaveLength(2)
  })

  it('renders empty state when data is empty', () => {
    render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        emptyTitle="No users found"
      />
    )

    expect(screen.getByText('No users found')).toBeInTheDocument()
  })

  it('renders skeleton rows when isLoading is true', () => {
    const { container } = render(
      <DataTable
        data={[]}
        columns={columns}
        keyExtractor={(item) => item.id}
        isLoading={true}
        loadingRowCount={3}
      />
    )

    const skeletons = container.querySelectorAll('.hs-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('triggers onRowClick when row is clicked', () => {
    const handleRowClick = vi.fn()
    render(
      <DataTable
        data={mockData}
        columns={columns}
        keyExtractor={(item) => item.id}
        onRowClick={handleRowClick}
      />
    )

    const row = screen.getByText('Alice Smith')
    fireEvent.click(row)
    expect(handleRowClick).toHaveBeenCalledWith(mockData[0])
  })
})
