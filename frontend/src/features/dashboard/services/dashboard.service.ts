import { apiClient } from '@/services/api'
import type {
  PipelineDashboardMetrics,
  CompanySummaryItem,
  UserSummaryItem,
  JobSummaryItem,
  ApplicationSummaryItem,
  InterviewSummaryItem,
} from '../types'
import type { AuthUser } from '@/types'

export interface PaginatedResult<T> {
  readonly data: readonly T[]
  readonly meta?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
  readonly pagination?: {
    readonly total: number
    readonly totalPages: number
    readonly page: number
    readonly limit: number
  }
}

export const dashboardService = {
  /**
   * Fetch company-wide hiring pipeline dashboard metrics
   * Backend: GET /pipeline/dashboard/company
   */
  getCompanyPipelineMetrics: async (): Promise<PipelineDashboardMetrics> => {
    const response = await apiClient.get<PipelineDashboardMetrics>(
      '/pipeline/dashboard/company'
    )
    return response.data!
  },

  /**
   * Fetch recruiter-specific hiring pipeline dashboard metrics
   * Backend: GET /pipeline/dashboard/recruiter
   */
  getRecruiterPipelineMetrics: async (): Promise<PipelineDashboardMetrics> => {
    const response = await apiClient.get<PipelineDashboardMetrics>(
      '/pipeline/dashboard/recruiter'
    )
    return response.data!
  },

  /**
   * Fetch platform companies with pagination
   * Backend: GET /companies
   */
  getCompanies: async (params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedResult<CompanySummaryItem>> => {
    const response = await apiClient.get<readonly CompanySummaryItem[]>(
      '/companies',
      { params }
    )
    const raw = response as unknown as { pagination?: PaginatedResult<CompanySummaryItem>['pagination']; meta?: PaginatedResult<CompanySummaryItem>['meta'] }
    return {
      data: response.data || [],
      pagination: raw.pagination,
      meta: raw.meta,
    }
  },

  /**
   * Fetch platform users with pagination
   * Backend: GET /users
   */
  getUsers: async (params?: {
    page?: number
    limit?: number
    role?: string
    status?: string
  }): Promise<PaginatedResult<UserSummaryItem>> => {
    const response = await apiClient.get<readonly UserSummaryItem[]>(
      '/users',
      { params }
    )
    const raw = response as unknown as { pagination?: PaginatedResult<UserSummaryItem>['pagination']; meta?: PaginatedResult<UserSummaryItem>['meta'] }
    return {
      data: response.data || [],
      meta: raw.meta,
      pagination: raw.pagination,
    }
  },

  /**
   * Fetch recent jobs
   * Backend: GET /jobs
   */
  getJobs: async (params?: {
    page?: number
    limit?: number
    status?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResult<JobSummaryItem>> => {
    const response = await apiClient.get<readonly JobSummaryItem[]>(
      '/jobs',
      { params }
    )
    return {
      data: response.data || [],
    }
  },

  /**
   * Fetch recent applications
   * Backend: GET /applications
   */
  getApplications: async (params?: {
    page?: number
    limit?: number
    status?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResult<ApplicationSummaryItem>> => {
    const response = await apiClient.get<readonly ApplicationSummaryItem[]>(
      '/applications',
      { params }
    )
    return {
      data: response.data || [],
    }
  },

  /**
   * Fetch scheduled interviews
   * Backend: GET /interviews
   */
  getInterviews: async (params?: {
    page?: number
    limit?: number
    status?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResult<InterviewSummaryItem>> => {
    const response = await apiClient.get<readonly InterviewSummaryItem[]>(
      '/interviews',
      { params }
    )
    return {
      data: response.data || [],
    }
  },

  /**
   * Fetch current authenticated user profile
   * Backend: GET /users/me
   */
  getCurrentUser: async (): Promise<AuthUser> => {
    const response = await apiClient.get<AuthUser>('/users/me')
    return response.data!
  },
}
