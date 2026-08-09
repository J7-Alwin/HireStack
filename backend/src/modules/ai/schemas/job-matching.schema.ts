import { z } from "zod";

export const JobMatchingSchema = z.object({
    matchPercentage: z.number().int().min(0).max(100),
    skillMatch: z.number().int().min(0).max(100),
    experienceMatch: z.number().int().min(0).max(100),
    educationMatch: z.number().int().min(0).max(100),
    projectMatch: z.number().int().min(0).max(100),
    keywordMatch: z.number().int().min(0).max(100),
    strengths: z.array(z.string()),
    missingSkills: z.array(z.string()),
    overallReason: z.string(),
    recommendation: z.enum(["STRONGLY_RECOMMENDED", "RECOMMENDED", "CONSIDER", "NOT_RECOMMENDED"]),
});

export const JobMatchingRequestSchema = z.object({
    jobId: z.string().cuid("Invalid job ID format"),
});
