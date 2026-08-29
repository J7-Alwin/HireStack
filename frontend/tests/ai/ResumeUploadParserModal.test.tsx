import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ResumeUploadParserModal } from '@/features/ai/components/ResumeUploadParserModal'
import { aiService } from '@/features/ai/services/ai.service'

describe('ResumeUploadParserModal Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    vi.restoreAllMocks()
  })

  it('renders modal dialog with upload instructions', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResumeUploadParserModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>
    )

    expect(screen.getByText('Upload & Parse Candidate Resume')).toBeInTheDocument()
    expect(screen.getByText(/Supported format: PDF only/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Parse & Create Candidate/i })).toBeDisabled()
  })

  it('validates and rejects non-PDF file formats', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResumeUploadParserModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>
    )

    const input = screen.getByLabelText(/Upload PDF resume/i)
    const invalidFile = new File(['mock content'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    fireEvent.change(input, { target: { files: [invalidFile] } })

    expect(
      await screen.findByText('Only PDF format (.pdf) resume files are supported.')
    ).toBeInTheDocument()
  })

  it('validates and rejects PDF files exceeding 10MB limit', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ResumeUploadParserModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>
    )

    const input = screen.getByLabelText(/Upload PDF resume/i)
    const largeBlob = new Uint8Array(11 * 1024 * 1024)
    const largeFile = new File([largeBlob], 'large-resume.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [largeFile] } })

    expect(
      await screen.findByText('Resume file size exceeds the 10MB limit.')
    ).toBeInTheDocument()
  })

  it('accepts valid PDF file and submits for parsing', async () => {
    const onSuccess = vi.fn()
    const onClose = vi.fn()

    vi.spyOn(aiService, 'parseResume').mockResolvedValueOnce({
      id: 'cand_1',
      candidateCode: 'CAN-001',
      firstName: 'Diana',
      lastName: 'Prince',
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <ResumeUploadParserModal
          isOpen={true}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </QueryClientProvider>
    )

    const input = screen.getByLabelText(/Upload PDF resume/i)
    const validFile = new File(['%PDF-1.4 mock content'], 'diana-resume.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [validFile] } })

    expect(screen.getByText('diana-resume.pdf')).toBeInTheDocument()
    const submitBtn = screen.getByRole('button', { name: /Parse & Create Candidate/i })
    expect(submitBtn).not.toBeDisabled()

    fireEvent.click(submitBtn)

    expect(
      await screen.findByText('Candidate Created Successfully')
    ).toBeInTheDocument()
    expect(screen.getByText(/Diana Prince/)).toBeInTheDocument()
    expect(screen.getByText(/CAN-001/)).toBeInTheDocument()
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cand_1', firstName: 'Diana' })
    )
  })

  it('displays error alert when parsing fails', async () => {
    vi.spyOn(aiService, 'parseResume').mockRejectedValueOnce(
      new Error('Failed to parse PDF contents: corrupted stream')
    )

    render(
      <QueryClientProvider client={queryClient}>
        <ResumeUploadParserModal isOpen={true} onClose={vi.fn()} />
      </QueryClientProvider>
    )

    const input = screen.getByLabelText(/Upload PDF resume/i)
    const validFile = new File(['%PDF-1.4 corrupt'], 'corrupt.pdf', {
      type: 'application/pdf',
    })

    fireEvent.change(input, { target: { files: [validFile] } })
    fireEvent.click(screen.getByRole('button', { name: /Parse & Create Candidate/i }))

    expect(await screen.findByText('Resume Parsing Failed')).toBeInTheDocument()
    expect(
      screen.getByText('Failed to parse PDF contents: corrupted stream')
    ).toBeInTheDocument()
  })
})
