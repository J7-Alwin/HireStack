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
    hiringRecommendation: string;
}

export interface ATSScoreRequest {
    candidateId: string;
    jobId: string;
}
