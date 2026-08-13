import { z } from "zod";

export const ResumeRecommendationItemSchema = z.object({
    category: z.enum([
        "SUMMARY",
        "EXPERIENCE",
        "SKILLS",
        "EDUCATION",
        "PROJECTS",
        "CERTIFICATIONS",
        "KEYWORDS",
        "ATS_OPTIMIZATION",
        "FORMATTING_AND_STRUCTURE",
    ]),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    currentIssue: z.string().min(1, "Current issue description is required"),
    recommendation: z.string().min(1, "Recommendation is required"),
    reason: z.string().min(1, "Reason is required"),
    evidence: z.string().default(""),
    expectedImprovement: z.string().min(1, "Expected improvement is required"),
    jobRequirement: z.string().optional(),
});

export const ResumeRecommendationSchema = z.object({
    overallSummary: z.string().min(1, "Overall summary is required"),
    recommendations: z.array(ResumeRecommendationItemSchema),
});

export const GeneralRecommendationRequestSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
});

export const JobSpecificRecommendationRequestSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
    jobId: z.string().cuid("Invalid job ID format"),
});

export const GetHistoryParamsSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
});

export const GetDetailsParamsSchema = z.object({
    id: z.string().cuid("Invalid recommendation ID format"),
});

export type ResumeRecommendationSchemaType = z.infer<typeof ResumeRecommendationSchema>;
