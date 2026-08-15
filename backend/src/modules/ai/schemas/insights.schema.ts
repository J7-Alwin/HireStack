import { z } from "zod";

export const GenerateAiInsightsSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
    jobId: z.string().cuid("Invalid job ID format"),
});

export const GetInsightsHistoryParamsSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
});

export const GetInsightsDetailsParamsSchema = z.object({
    id: z.string().cuid("Invalid AI Insight ID format"),
});

export const AiInsightResponseSchema = z.object({
    overallInsight: z.string().min(1, "Overall insight is required"),
    strengths: z.array(z.string().min(1, "Strength item cannot be empty")).min(1, "At least one strength is required"),
    weaknesses: z.array(z.string().min(1, "Weakness item cannot be empty")).default([]),
    skillGaps: z.array(z.string().min(1, "Skill gap item cannot be empty")).default([]),
    experienceConcerns: z.array(z.string().min(1, "Experience concern item cannot be empty")).default([]),
    hiringRisks: z.array(z.string().min(1, "Hiring risk item cannot be empty")).default([]),
    hiringConfidence: z.number().int().min(0, "Hiring confidence must be between 0 and 100").max(100, "Hiring confidence must be between 0 and 100"),
    jobFitObservations: z.array(z.string().min(1, "Job fit observation cannot be empty")).default([]),
    recruiterFocusAreas: z.array(z.string().min(1, "Recruiter focus area cannot be empty")).default([]),
    recommendation: z.string().min(1, "Recommendation is required"),
});

export type GenerateAiInsightsSchemaType = z.infer<typeof GenerateAiInsightsSchema>;
export type GetInsightsHistoryParamsSchemaType = z.infer<typeof GetInsightsHistoryParamsSchema>;
export type GetInsightsDetailsParamsSchemaType = z.infer<typeof GetInsightsDetailsParamsSchema>;
export type AiInsightResponseSchemaType = z.infer<typeof AiInsightResponseSchema>;
