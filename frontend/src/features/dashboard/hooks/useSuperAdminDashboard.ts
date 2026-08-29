import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { dashboardKeys } from './dashboard-query-keys'
import type { SuperAdminDashboardData } from '../types'

export function useSuperAdminDashboard() {
  return useQuery<SuperAdminDashboardData>({
    queryKey: dashboardKeys.superAdmin(),
    queryFn: async () => {
      const [companiesResponse, usersResponse] = await Promise.all([
        dashboardService.getCompanies({ page: 1, limit: 10 }),
        dashboardService.getUsers({ page: 1, limit: 10 }),
      ])

      const totalCompanies =
        companiesResponse.pagination?.total ?? companiesResponse.meta?.total ?? companiesResponse.data.length
      const totalUsers =
        usersResponse.meta?.total ?? usersResponse.pagination?.total ?? usersResponse.data.length

      const activeCompanies = companiesResponse.data.filter(
        (c) => c.status === 'ACTIVE'
      ).length

      const activeUsers = usersResponse.data.filter(
        (u) => u.status === 'ACTIVE'
      ).length

      return {
        totalCompanies,
        activeCompanies,
        totalUsers,
        activeUsers,
        recentCompanies: companiesResponse.data,
        recentUsers: usersResponse.data,
      }
    },
    staleTime: 60 * 1000, // 1 minute fresh
  })
}
