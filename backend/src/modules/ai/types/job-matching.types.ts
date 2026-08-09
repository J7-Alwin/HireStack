import { HiringRecommendationType } from "./ats.types";

export interface CandidateMatchResponse {
    candidateId: string;
    candidateName: string;
    matchPercentage: number;
    recommendation: HiringRecommendationType;
}

export interface JobMatchingResponse {
    jobId: string;
    totalCandidates: number;
    generatedAt: string;
    matches: CandidateMatchResponse[];
}

export interface JobMatchingRequest {
    jobId: string;
}

export interface JobMatchingAIResponse {
    matchPercentage: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    projectMatch: number;
    keywordMatch: number;
    strengths: string[];
    missingSkills: string[];
    overallReason: string;
    recommendation: HiringRecommendationType;
}

export interface JobMatchDetailsResponse {
    id: string;
    jobId: string;
    candidateId: string;
    candidateName: string;
    matchPercentage: number;
    skillMatch: number;
    experienceMatch: number;
    educationMatch: number;
    projectMatch: number;
    keywordMatch: number;
    strengths: string[];
    missingSkills: string[];
    overallReason: string;
    recommendation: HiringRecommendationType;
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}
