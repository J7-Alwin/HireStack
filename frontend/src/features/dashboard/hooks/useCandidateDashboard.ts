import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboard.service'
import { dashboardKeys } from './dashboard-query-keys'
import type { AuthUser } from '@/types'

export function useCandidateDashboard() {
  return useQuery<AuthUser>({
    queryKey: dashboardKeys.candidate(),
    queryFn: async () => {
      return await dashboardService.getCurrentUser()
    },
    staleTime: 60 * 1000,
  })
}
