export const dashboardKeys = {
  all: ['dashboard'] as const,
  superAdmin: () => [...dashboardKeys.all, 'super-admin'] as const,
  companyAdmin: () => [...dashboardKeys.all, 'company-admin'] as const,
  recruiter: () => [...dashboardKeys.all, 'recruiter'] as const,
  candidate: () => [...dashboardKeys.all, 'candidate'] as const,
  pipelineCompany: () => [...dashboardKeys.all, 'pipeline-company'] as const,
  pipelineRecruiter: () => [...dashboardKeys.all, 'pipeline-recruiter'] as const,
  recentJobs: () => [...dashboardKeys.all, 'recent-jobs'] as const,
  recentApplications: (recruiterId?: string) =>
    [...dashboardKeys.all, 'recent-applications', { recruiterId }] as const,
  upcomingInterviews: (recruiterId?: string) =>
    [...dashboardKeys.all, 'upcoming-interviews', { recruiterId }] as const,
}
