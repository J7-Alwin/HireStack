import { z } from "zod";

export const InterviewQuestionCategoryEnum = z.enum([
    "TECHNICAL",
    "HR",
    "BEHAVIORAL",
    "PROJECT",
    "ROLE_SPECIFIC",
    "FOLLOW_UP",
]);

export const InterviewDifficultyEnum = z.enum(["EASY", "MEDIUM", "HARD"]);

export const InterviewQuestionSchema = z.object({
    category: InterviewQuestionCategoryEnum,
    question: z.string().min(1, "Question is required"),
    reason: z.string().min(1, "Reason is required"),
    difficulty: InterviewDifficultyEnum,
    followUps: z.array(z.string()),
});

export const InterviewResponseSchema = z.object({
    overallSummary: z.string().min(1, "Overall summary is required"),
    questions: z.array(InterviewQuestionSchema).min(1, "At least one question is required"),
});

export const GeneralInterviewRequestSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
});

export const JobSpecificInterviewRequestSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
    jobId: z.string().cuid("Invalid job ID format"),
});

export const GetInterviewHistoryParamsSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
});

export const GetInterviewDetailsParamsSchema = z.object({
    id: z.string().cuid("Invalid interview ID format"),
});

export type InterviewQuestionSchemaType = z.infer<typeof InterviewQuestionSchema>;
export type InterviewResponseSchemaType = z.infer<typeof InterviewResponseSchema>;
export type GeneralInterviewRequestSchemaType = z.infer<typeof GeneralInterviewRequestSchema>;
export type JobSpecificInterviewRequestSchemaType = z.infer<typeof JobSpecificInterviewRequestSchema>;
