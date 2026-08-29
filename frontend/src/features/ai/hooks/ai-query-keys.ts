export const aiKeys = {
  all: ['ai'] as const,
  health: () => [...aiKeys.all, 'health'] as const,

  // Job matching
  jobMatches: (jobId: string) => [...aiKeys.all, 'job-matching', jobId] as const,
  jobMatchDetail: (jobId: string, candidateId: string) =>
    [...aiKeys.all, 'job-matching', jobId, candidateId] as const,

  // Resume recommendations
  resumeRecommendations: () => [...aiKeys.all, 'resume-recommendations'] as const,
  resumeRecommendationHistories: () =>
    [...aiKeys.resumeRecommendations(), 'history'] as const,
  resumeRecommendationHistory: (candidateId: string) =>
    [...aiKeys.resumeRecommendationHistories(), candidateId] as const,
  resumeRecommendationDetail: (id: string) =>
    [...aiKeys.resumeRecommendations(), 'detail', id] as const,

  // Interview assistant
  interviewAssistants: () => [...aiKeys.all, 'interview-assistant'] as const,
  interviewAssistantHistories: () =>
    [...aiKeys.interviewAssistants(), 'history'] as const,
  interviewAssistantHistory: (candidateId: string) =>
    [...aiKeys.interviewAssistantHistories(), candidateId] as const,
  interviewAssistantDetail: (id: string) =>
    [...aiKeys.interviewAssistants(), 'detail', id] as const,

  // AI insights
  insights: () => [...aiKeys.all, 'insights'] as const,
  insightHistories: () => [...aiKeys.insights(), 'history'] as const,
  insightHistory: (candidateId: string) =>
    [...aiKeys.insightHistories(), candidateId] as const,
  insightDetail: (id: string) => [...aiKeys.insights(), 'detail', id] as const,
}
