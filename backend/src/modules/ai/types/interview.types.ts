import { InterviewAssistantMode } from "@prisma/client";

export { InterviewAssistantMode };

export type InterviewQuestionCategory =
    | "TECHNICAL"
    | "HR"
    | "BEHAVIORAL"
    | "PROJECT"
    | "ROLE_SPECIFIC"
    | "FOLLOW_UP";

export type InterviewDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface InterviewQuestion {
    category: InterviewQuestionCategory;
    question: string;
    reason: string;
    difficulty: InterviewDifficulty;
    followUps: string[];
}

export interface GeneralInterviewRequest {
    candidateId: string;
}

export interface JobSpecificInterviewRequest {
    candidateId: string;
    jobId: string;
}

export interface InterviewAssistantRequest {
    candidateId: string;
    jobId?: string;
}

export interface InterviewAIResponse {
    overallSummary: string;
    questions: InterviewQuestion[];
}

export interface InterviewAssistantResponse {
    id: string;
    candidateId: string;
    jobId?: string | null;
    mode: InterviewAssistantMode;
    overallSummary: string;
    questions: InterviewQuestion[];
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}

export type InterviewResponse = InterviewAssistantResponse;

export interface InterviewHistoryItem {
    id: string;
    candidateId: string;
    jobId?: string | null;
    jobTitle?: string | null;
    mode: InterviewAssistantMode;
    overallSummary: string;
    totalQuestions: number;
    aiModel: string;
    promptVersion: string;
    createdAt: string;
    updatedAt: string;
}

export interface InterviewHistoryResponse {
    candidateId: string;
    totalGenerations: number;
    history: InterviewAssistantResponse[];
}

export type InterviewDetailsResponse = InterviewAssistantResponse;
