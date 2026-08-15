export interface GenerateAiInsightsInput {
    candidateId: string;
    jobId: string;
}

export interface AiInsightResponse {
    id: string;
    candidateId: string;
    jobId: string | null;
    overallInsight: string;
    strengths: string[];
    weaknesses: string[];
    skillGaps: string[];
    experienceConcerns: string[];
    hiringRisks: string[];
    hiringConfidence: number;
    jobFitObservations: string[];
    recruiterFocusAreas: string[];
    recommendation: string;
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}

export interface AiInsightHistoryItem {
    id: string;
    candidateId: string;
    jobId: string | null;
    overallInsight: string;
    hiringConfidence: number;
    recommendation: string;
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}

export type AiInsightHistoryResponse = AiInsightHistoryItem[];

export type AiInsightDetailsResponse = AiInsightResponse;
