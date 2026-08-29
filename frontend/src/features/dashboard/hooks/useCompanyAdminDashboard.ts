import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { dashboardKeys } from './dashboard-query-keys'
import type { CompanyAdminDashboardData } from '../types'

export function useCompanyAdminDashboard() {
  return useQuery<CompanyAdminDashboardData>({
    queryKey: dashboardKeys.companyAdmin(),
    queryFn: async () => {
      const [pipelineMetrics, jobsResponse, applicationsResponse, interviewsResponse] =
        await Promise.all([
          dashboardService.getCompanyPipelineMetrics(),
          dashboardService.getJobs({ page: 1, limit: 5, sortOrder: 'desc' }),
          dashboardService.getApplications({ page: 1, limit: 5, sortOrder: 'desc' }),
          dashboardService.getInterviews({ page: 1, limit: 5, sortOrder: 'desc' }),
        ])

      return {
        pipelineMetrics,
        recentJobs: jobsResponse.data,
        recentApplications: applicationsResponse.data,
        upcomingInterviews: interviewsResponse.data,
      }
    },
    staleTime: 60 * 1000,
  })
}
