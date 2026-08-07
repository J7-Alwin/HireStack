export type HiringRecommendationType = 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'CONSIDER' | 'NOT_RECOMMENDED';

export interface ATSScoreResponse {
    overallScore: number;
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    keywordScore: number;
    certificationScore: number;
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    recommendations: string[];
    hiringRecommendation: HiringRecommendationType;
    overallReason: string;
}

export interface ATSScoreRequest {
    candidateId: string;
    jobId: string;
}
