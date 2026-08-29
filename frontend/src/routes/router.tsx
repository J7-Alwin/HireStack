import { createBrowserRouter } from 'react-router-dom'
import { FoundationRoot } from './FoundationRoot'
import { NotFoundPage } from './NotFoundPage'
import { ForbiddenPage } from './ForbiddenPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import { LoginPage } from '@/features/auth'
import { DashboardRouter } from '@/features/dashboard'
import {
  CandidatesPage,
  CandidateDetailPage,
  CandidateCreatePage,
  CandidateEditPage,
} from '@/features/candidates'
import {
  JobsPage,
  JobDetailPage,
  JobCreatePage,
  JobEditPage,
} from '@/features/jobs'
import {
  ApplicationsPage,
  ApplicationDetailPage,
  ApplicationCreatePage,
  ApplicationEditPage,
} from '@/features/applications'
import {
  InterviewsPage,
  InterviewDetailPage,
  InterviewCreatePage,
  InterviewEditPage,
} from '@/features/interviews'
import {
  OffersPage,
  OfferDetailPage,
  OfferCreatePage,
  OfferEditPage,
} from '@/features/offers'
import { PipelinePage } from '@/features/pipeline'
import { AppShell, PageContainer } from '@/components/layout'
import { Role } from '@/types'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <FoundationRoot />,
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/forbidden',
    element: <ForbiddenPage />,
  },
  {
    path: '/app',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <PageContainer>
            <DashboardRouter />
          </PageContainer>
        ),
      },
      // Candidates Module (Stage 7B)
      {
        path: 'candidates',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <CandidatesPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'candidates/new',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <CandidateCreatePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'candidates/:candidateId',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <CandidateDetailPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'candidates/:candidateId/edit',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <CandidateEditPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      // Jobs Module (Stage 7C)
      {
        path: 'jobs',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <JobsPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'jobs/new',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <JobCreatePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'jobs/:jobId',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <JobDetailPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'jobs/:jobId/edit',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <JobEditPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      // Applications Module (Stage 7D)
      {
        path: 'applications',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <ApplicationsPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'applications/new',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <ApplicationCreatePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'applications/:applicationId',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <ApplicationDetailPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'applications/:applicationId/edit',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <ApplicationEditPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      // Interviews Module (Stage 7E)
      {
        path: 'interviews',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <InterviewsPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'interviews/new',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <InterviewCreatePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'interviews/:interviewId',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <InterviewDetailPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'interviews/:interviewId/edit',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <InterviewEditPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      // Offers Module (Stage 7F)
      {
        path: 'offers',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <OffersPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'offers/new',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <OfferCreatePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'offers/:offerId',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <OfferDetailPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      {
        path: 'offers/:offerId/edit',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <OfferEditPage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
      // Hiring Pipeline Module (Stage 7G)
      {
        path: 'pipeline',
        element: (
          <ProtectedRoute allowedRoles={[Role.COMPANY_ADMIN, Role.RECRUITER]}>
            <PageContainer>
              <PipelinePage />
            </PageContainer>
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
