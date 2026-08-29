import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { dashboardKeys } from './dashboard-query-keys'
import type { RecruiterDashboardData } from '../types'

export function useRecruiterDashboard() {
  return useQuery<RecruiterDashboardData>({
    queryKey: dashboardKeys.recruiter(),
    queryFn: async () => {
      const [pipelineMetrics, applicationsResponse, interviewsResponse] =
        await Promise.all([
          dashboardService.getRecruiterPipelineMetrics(),
          dashboardService.getApplications({ page: 1, limit: 5, sortOrder: 'desc' }),
          dashboardService.getInterviews({ page: 1, limit: 5, sortOrder: 'desc' }),
        ])

      return {
        pipelineMetrics,
        assignedApplications: applicationsResponse.data,
        upcomingInterviews: interviewsResponse.data,
      }
    },
    staleTime: 60 * 1000,
  })
}
