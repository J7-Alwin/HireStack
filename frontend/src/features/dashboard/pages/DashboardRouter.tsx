import { useAuth } from '@/features/auth'
import { Role } from '@/types'
import { SuperAdminDashboardPage } from './SuperAdminDashboardPage'
import { CompanyAdminDashboardPage } from './CompanyAdminDashboardPage'
import { RecruiterDashboardPage } from './RecruiterDashboardPage'
import { CandidateDashboardPage } from './CandidateDashboardPage'
import { ErrorState } from '@/components/ui'

export function DashboardRouter() {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return (
      <ErrorState
        title="Authentication required"
        description="Please sign in to access your HireStack ATS dashboard."
      />
    )
  }

  switch (user.role) {
    case Role.SUPER_ADMIN:
      return <SuperAdminDashboardPage />
    case Role.COMPANY_ADMIN:
      return <CompanyAdminDashboardPage />
    case Role.RECRUITER:
      return <RecruiterDashboardPage />
    case Role.CANDIDATE:
      return <CandidateDashboardPage />
    default:
      return (
        <ErrorState
          title="Unsupported Account Role"
          description="Your account role is not supported for dashboard viewing."
        />
      )
  }
}
