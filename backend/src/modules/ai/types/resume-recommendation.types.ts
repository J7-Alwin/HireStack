export type ResumeRecommendationCategory =
    | "SUMMARY"
    | "EXPERIENCE"
    | "SKILLS"
    | "EDUCATION"
    | "PROJECTS"
    | "CERTIFICATIONS"
    | "KEYWORDS"
    | "ATS_OPTIMIZATION"
    | "FORMATTING_AND_STRUCTURE";

export type ResumeRecommendationPriority = "HIGH" | "MEDIUM" | "LOW";

export interface ResumeRecommendationItem {
    category: ResumeRecommendationCategory;
    priority: ResumeRecommendationPriority;
    currentIssue: string;
    recommendation: string;
    reason: string;
    evidence: string;
    expectedImprovement: string;
    jobRequirement?: string;
}

export type ResumeRecommendationMode = "GENERAL" | "JOB_SPECIFIC";

export interface ResumeRecommendationResponse {
    id: string;
    candidateId: string;
    jobId?: string | null;
    mode: ResumeRecommendationMode;
    overallSummary: string;
    recommendations: ResumeRecommendationItem[];
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}

export interface ResumeRecommendationRequest {
    candidateId: string;
    jobId?: string;
}
