import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Role, AccountStatus } from '@/types'
import { useAuthStore } from '@/stores'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { CandidateDetailPage } from '@/features/candidates/pages/CandidateDetailPage'
import { JobDetailPage } from '@/features/jobs/pages/JobDetailPage'
import { ApplicationDetailPage } from '@/features/applications/pages/ApplicationDetailPage'
import { ApplicationCreatePage } from '@/features/applications/pages/ApplicationCreatePage'
import { InterviewCreatePage } from '@/features/interviews/pages/InterviewCreatePage'
import { OfferCreatePage } from '@/features/offers/pages/OfferCreatePage'
import { RecruiterDashboardPage } from '@/features/dashboard/pages/RecruiterDashboardPage'
import { CompanyAdminDashboardPage } from '@/features/dashboard/pages/CompanyAdminDashboardPage'
import { getNavigationForUser } from '@/config/navigation.config'
import { candidatesService } from '@/features/candidates/services/candidates.service'
import { jobsService } from '@/features/jobs/services/jobs.service'
import { applicationsService } from '@/features/applications/services/applications.service'
import { dashboardService } from '@/features/dashboard/services/dashboard.service'
import { aiService } from '@/features/ai/services/ai.service'

const mockRecruiterUser = {
  id: 'usr_recruiter',
  email: 'recruiter@hirestack.test',
  firstName: 'Jane',
  lastName: 'Recruiter',
  role: Role.RECRUITER,
  status: AccountStatus.ACTIVE,
  companyId: 'comp-1',
  company: { id: 'comp-1', name: 'HireStack Inc', slug: 'hirestack' },
}

const mockCompanyAdminUser = {
  id: 'usr_admin',
  email: 'admin@hirestack.test',
  firstName: 'Alex',
  lastName: 'Admin',
  role: Role.COMPANY_ADMIN,
  status: AccountStatus.ACTIVE,
  companyId: 'comp-1',
  company: { id: 'comp-1', name: 'HireStack Inc', slug: 'hirestack' },
}

const mockCandidateUser = {
  id: 'usr_cand',
  email: 'candidate@hirestack.test',
  firstName: 'John',
  lastName: 'Candidate',
  role: Role.CANDIDATE,
  status: AccountStatus.ACTIVE,
  companyId: null,
}

const mockSuperAdminUser = {
  id: 'usr_super',
  email: 'super@hirestack.test',
  firstName: 'Super',
  lastName: 'Admin',
  role: Role.SUPER_ADMIN,
  status: AccountStatus.ACTIVE,
  companyId: null,
}

const sampleCandidate = {
  id: 'cand_123',
  companyId: 'comp-1',
  candidateCode: 'CAND-00123',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice.smith@example.com',
  phone: '+1 555-0199',
  city: 'San Francisco',
  country: 'USA',
  status: 'ACTIVE',
  isActive: true,
  experienceYears: 5,
  currentDesignation: 'Senior Frontend Engineer',
  currentCompany: 'Tech Corp',
  notes: [],
  tags: [],
  documents: [],
  createdAt: '2026-01-15T10:00:00.000Z',
  updatedAt: '2026-01-15T10:00:00.000Z',
}

const sampleJob = {
  id: 'job_456',
  companyId: 'comp-1',
  jobCode: 'JOB-00456',
  title: 'Lead React Developer',
  status: 'OPEN',
  openings: 2,
  location: 'Remote, US',
  workplaceType: 'REMOTE',
  employmentType: 'FULL_TIME',
  department: { id: 'dept-1', name: 'Engineering' },
  description: 'Lead modern TypeScript and React applications.',
  createdAt: '2026-01-10T10:00:00.000Z',
  updatedAt: '2026-01-10T10:00:00.000Z',
}

const sampleApplication = {
  id: 'app_789',
  companyId: 'comp-1',
  applicationCode: 'APP-00789',
  stage: 'INTERVIEW',
  status: 'ACTIVE',
  candidateId: 'cand_123',
  jobId: 'job_456',
  candidate: {
    id: 'cand_123',
    candidateCode: 'CAND-00123',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice.smith@example.com',
  },
  job: {
    id: 'job_456',
    jobCode: 'JOB-00456',
    title: 'Lead React Developer',
    status: 'OPEN',
  },
  createdAt: '2026-01-20T10:00:00.000Z',
  updatedAt: '2026-01-20T10:00:00.000Z',
}

const sampleRecruiterPipelineMetrics = {
  activeCandidates: 14,
  hiredCount: 3,
  interviewsToday: 2,
  offersPending: 1,
  stageBreakdown: [
    { stage: 'APPLIED', count: 4 },
    { stage: 'SCREENING', count: 3 },
    { stage: 'SHORTLISTED', count: 2 },
    { stage: 'INTERVIEW', count: 4 },
    { stage: 'OFFER', count: 1 },
  ],
}

const sampleCompanyPipelineMetrics = {
  activeCandidates: 45,
  hiredCount: 12,
  interviewsToday: 5,
  offersPending: 4,
  stageBreakdown: [
    { stage: 'APPLIED', count: 15 },
    { stage: 'SCREENING', count: 10 },
    { stage: 'SHORTLISTED', count: 8 },
    { stage: 'INTERVIEW', count: 8 },
    { stage: 'OFFER', count: 4 },
  ],
}

describe('Stage 9: Product Workflow & Cross-Module Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.restoreAllMocks()
    useAuthStore.getState().reset()
    useAuthStore.getState().setAuthenticated(mockRecruiterUser)

    vi.spyOn(aiService, 'getResumeRecommendationHistory').mockResolvedValue([])
    vi.spyOn(aiService, 'getInterviewAssistantHistory').mockResolvedValue({
      candidateId: 'cand_123',
      totalGenerations: 0,
      history: [],
    })
    vi.spyOn(aiService, 'getAiInsightHistory').mockResolvedValue([])
    vi.spyOn(aiService, 'getJobMatches').mockResolvedValue([])
  })

  describe('1. Role-Aware Navigation Structure', () => {
    it('provides complete ATS module navigation for RECRUITER & COMPANY_ADMIN', () => {
      const recruiterNav = getNavigationForUser(mockRecruiterUser)
      const companyAdminNav = getNavigationForUser(mockCompanyAdminUser)

      const recruiterPaths = recruiterNav.flatMap((s) => s.items.map((i) => i.path))
      expect(recruiterPaths).toContain('/app')
      expect(recruiterPaths).toContain('/app/jobs')
      expect(recruiterPaths).toContain('/app/candidates')
      expect(recruiterPaths).toContain('/app/applications')
      expect(recruiterPaths).toContain('/app/interviews')
      expect(recruiterPaths).toContain('/app/offers')
      expect(recruiterPaths).toContain('/app/pipeline')

      const adminPaths = companyAdminNav.flatMap((s) => s.items.map((i) => i.path))
      expect(adminPaths).toContain('/app/jobs')
      expect(adminPaths).toContain('/app/candidates')
      expect(adminPaths).toContain('/app/pipeline')
    })

    it('restricts CANDIDATE and SUPER_ADMIN from recruiter ATS modules', () => {
      const candidateNav = getNavigationForUser(mockCandidateUser)
      const candidatePaths = candidateNav.flatMap((s) => s.items.map((i) => i.path))
      expect(candidatePaths).not.toContain('/app/candidates')
      expect(candidatePaths).not.toContain('/app/jobs')
      expect(candidatePaths).not.toContain('/app/pipeline')

      const superAdminNav = getNavigationForUser(mockSuperAdminUser)
      const superPaths = superAdminNav.flatMap((s) => s.items.map((i) => i.path))
      expect(superPaths).not.toContain('/app/candidates')
      expect(superPaths).not.toContain('/app/pipeline')
    })
  })

  describe('2. Candidate to Application Workflow Integration', () => {
    it('renders Candidate Detail with Add Application action button', async () => {
      vi.spyOn(candidatesService, 'getCandidateById').mockResolvedValue(sampleCandidate as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/candidates/cand_123']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/candidates/:candidateId" element={<CandidateDetailPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(await screen.findByText('Alice Smith')).toBeInTheDocument()
      const addAppBtn = screen.getByRole('button', { name: /Add Application/i })
      expect(addAppBtn).toBeInTheDocument()
    })

    it('ApplicationCreatePage pre-populates candidateId from URL query parameter', async () => {
      vi.spyOn(candidatesService, 'listCandidates').mockResolvedValue({
        data: [sampleCandidate],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)
      vi.spyOn(jobsService, 'listJobs').mockResolvedValue({
        data: [sampleJob],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/applications/new?candidateId=cand_123']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/applications/new" element={<ApplicationCreatePage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => {
        const candidateSelect = screen.getByLabelText(/Candidate/i) as HTMLSelectElement
        expect(candidateSelect.value).toBe('cand_123')
      })
    })
  })

  describe('3. Job to Application & Pipeline Workflow Integration', () => {
    it('renders Job Detail with Add Applicant and Pipeline action buttons', async () => {
      vi.spyOn(jobsService, 'getJobById').mockResolvedValue(sampleJob as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/jobs/job_456']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/jobs/:jobId" element={<JobDetailPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(await screen.findByText('Lead React Developer')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add Applicant/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Pipeline/i })).toBeInTheDocument()
    })

    it('ApplicationCreatePage pre-populates jobId from URL query parameter', async () => {
      vi.spyOn(candidatesService, 'listCandidates').mockResolvedValue({
        data: [sampleCandidate],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)
      vi.spyOn(jobsService, 'listJobs').mockResolvedValue({
        data: [sampleJob],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/applications/new?jobId=job_456']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/applications/new" element={<ApplicationCreatePage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => {
        const jobSelect = screen.getByLabelText(/Target Job Requisition/i) as HTMLSelectElement
        expect(jobSelect.value).toBe('job_456')
      })
    })
  })

  describe('4. Application to Interview and Offer Integration', () => {
    it('renders Application Detail with Schedule Interview, Create Offer, and Pipeline buttons', async () => {
      vi.spyOn(applicationsService, 'getApplicationById').mockResolvedValue(sampleApplication as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/applications/app_789']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/applications/:applicationId" element={<ApplicationDetailPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(await screen.findByText(/Application: APP-00789/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Schedule Interview/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Create Offer/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Pipeline/i })).toBeInTheDocument()
    })

    it('InterviewCreatePage pre-populates applicationId from URL query parameter', async () => {
      vi.spyOn(applicationsService, 'listApplications').mockResolvedValue({
        data: [sampleApplication],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/interviews/new?applicationId=app_789']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/interviews/new" element={<InterviewCreatePage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => {
        const appSelect = screen.getByLabelText(/Application/i) as HTMLSelectElement
        expect(appSelect.value).toBe('app_789')
      })
    })

    it('OfferCreatePage pre-populates applicationId from URL query parameter', async () => {
      vi.spyOn(applicationsService, 'listApplications').mockResolvedValue({
        data: [sampleApplication],
        meta: { total: 1, page: 1, limit: 100, totalPages: 1 },
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app/offers/new?applicationId=app_789']}>
            <AuthProvider>
              <Routes>
                <Route path="/app/offers/new" element={<OfferCreatePage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      await waitFor(() => {
        const appSelect = screen.getByLabelText(/Application/i) as HTMLSelectElement
        expect(appSelect.value).toBe('app_789')
      })
    })
  })

  describe('5. Dashboards Direct Navigation Links', () => {
    it('Recruiter Dashboard links application and interview rows to detail pages', async () => {
      vi.spyOn(dashboardService, 'getRecruiterPipelineMetrics').mockResolvedValue(
        sampleRecruiterPipelineMetrics as any
      )
      vi.spyOn(dashboardService, 'getApplications').mockResolvedValue({
        data: [sampleApplication],
      } as any)
      vi.spyOn(dashboardService, 'getInterviews').mockResolvedValue({
        data: [
          {
            id: 'int_101',
            interviewCode: 'INT-00101',
            interviewType: 'TECHNICAL',
            round: 'TECHNICAL',
            status: 'SCHEDULED',
            scheduledDate: '2026-02-01T15:00:00.000Z',
          },
        ],
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app']}>
            <AuthProvider>
              <Routes>
                <Route path="/app" element={<RecruiterDashboardPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(await screen.findByText('Recruiting Overview')).toBeInTheDocument()

      const appLink = screen.getByRole('link', { name: 'APP-00789' })
      expect(appLink).toHaveAttribute('href', '/app/applications/app_789')

      const candLink = screen.getByRole('link', { name: 'Alice Smith' })
      expect(candLink).toHaveAttribute('href', '/app/candidates/cand_123')

      const intLink = screen.getByRole('link', { name: 'TECHNICAL' })
      expect(intLink).toHaveAttribute('href', '/app/interviews/int_101')
    })

    it('Company Admin Dashboard links jobs and applications to detail pages', async () => {
      useAuthStore.getState().setAuthenticated(mockCompanyAdminUser)
      vi.spyOn(dashboardService, 'getCompanyPipelineMetrics').mockResolvedValue(
        sampleCompanyPipelineMetrics as any
      )
      vi.spyOn(dashboardService, 'getJobs').mockResolvedValue({
        data: [sampleJob],
      } as any)
      vi.spyOn(dashboardService, 'getApplications').mockResolvedValue({
        data: [sampleApplication],
      } as any)
      vi.spyOn(dashboardService, 'getInterviews').mockResolvedValue({
        data: [],
      } as any)

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/app']}>
            <AuthProvider>
              <Routes>
                <Route path="/app" element={<CompanyAdminDashboardPage />} />
              </Routes>
            </AuthProvider>
          </MemoryRouter>
        </QueryClientProvider>
      )

      expect(await screen.findByText('Company Overview')).toBeInTheDocument()

      const jobLink = screen.getByRole('link', { name: 'Lead React Developer' })
      expect(jobLink).toHaveAttribute('href', '/app/jobs/job_456')

      const appLink = screen.getByRole('link', { name: 'APP-00789' })
      expect(appLink).toHaveAttribute('href', '/app/applications/app_789')
    })
  })
})
