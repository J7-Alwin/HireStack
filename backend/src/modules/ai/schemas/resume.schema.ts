import { z } from "zod";

export const ResumeSchema = z.object({
    firstName: z.string(),

    lastName: z.string(),

    email: z.string().email(),

    phone: z.string(),

    location: z.string(),

    summary: z.string(),

    skills: z.array(
        z.object({
            name: z.string(),
            level: z.string(),
        })
    ),

    education: z.array(
        z.object({
            institution: z.string(),
            degree: z.string(),
            field: z.string(),
            startYear: z.string(),
            endYear: z.string(),
        })
    ),

    experience: z.array(
        z.object({
            company: z.string(),
            position: z.string(),
            startDate: z.string(),
            endDate: z.string(),
            currentlyWorking: z.boolean(),
            description: z.string(),
        })
    ),

    projects: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            technologies: z.array(z.string()),
        })
    ),

    certifications: z.array(
        z.object({
            name: z.string(),
            issuer: z.string(),
            year: z.string(),
        })
    ),

    languages: z.array(z.string()),

    rawText: z.string(),
});

export type ResumeSchemaType = z.infer<typeof ResumeSchema>;