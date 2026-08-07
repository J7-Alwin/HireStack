import { z } from "zod";

export const AtsScoreSchema = z.object({
    overallScore: z.number().int().min(0).max(100),
    skillScore: z.number().int().min(0).max(100),
    experienceScore: z.number().int().min(0).max(100),
    educationScore: z.number().int().min(0).max(100),
    keywordScore: z.number().int().min(0).max(100),
    certificationScore: z.number().int().min(0).max(100),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    missingSkills: z.array(z.string()),
    recommendations: z.array(z.string()),
    hiringRecommendation: z.string(),
});

export type AtsScoreSchemaType = z.infer<typeof AtsScoreSchema>;

export const AtsScoreRequestSchema = z.object({
    candidateId: z.string().cuid("Invalid candidate ID format"),
    jobId: z.string().cuid("Invalid job ID format"),
});
