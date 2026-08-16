import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { logger } from "../../../shared/logger/logger";
import { ValidationError } from "../../../shared/errors";
import { PromptBuilder } from "../utils/prompt-builder";
import { JsonParser } from "../utils/json-parser";
import { PdfExtractor } from "../utils/pdf-extractor";
import { aiService } from "./ai.service";
import { aiOptimizationService } from "./ai-optimization.service";
import { SafeCandidate } from "../../candidates/candidate.types";
import { SafeJob } from "../../jobs/job.types";

export class AiEvaluationService {
    async evaluate<T>(
        candidate: SafeCandidate,
        job: SafeJob | null | undefined,
        promptConfig: { template: string; version: string; name: string },
        schema: z.ZodSchema<T>,
        extraContext?: string
    ): Promise<T> {
        logger.info(`AI Evaluation Started for candidate ${candidate.id} and job ${job?.id || "none"}`);

        try {
            // Find resume document if any
            const resumeDoc = candidate.documents?.find(
                (doc) => doc.documentType === "RESUME" && doc.isActive
            );

            // Try to extract raw text from resume PDF
            let rawText: string | null = null;
            if (resumeDoc) {
                let filePath: string;
                if (resumeDoc.fileUrl.startsWith("http")) {
                    const filename = path.basename(resumeDoc.fileUrl);
                    filePath = path.join(__dirname, "../../../../uploads/resumes", filename);
                } else {
                    filePath = path.join(__dirname, "../../../..", resumeDoc.fileUrl);
                }

                if (!fs.existsSync(filePath)) {
                    logger.error(`Resume PDF file not found at path: ${filePath}`);
                    throw new ValidationError("Resume PDF file could not be accessed.");
                }

                try {
                    const buffer = await fs.promises.readFile(filePath);
                    rawText = await PdfExtractor.extract(buffer);
                } catch (error) {
                    const errMsg = error instanceof Error ? error.message : String(error);
                    logger.error(`Failed to extract text from resume PDF: ${errMsg}`);
                    throw new ValidationError("Resume PDF file could not be accessed.");
                }
            }

            // Build ATS/Job Match Prompt input details
            const candidateSkillsString = candidate.skills && candidate.skills.length > 0
                ? candidate.skills.map((s) => `${s.skill.name} (${s.proficiency || 'Intermediate'})`).join(", ")
                : "None";

            const candidateExperienceString = candidate.experience && candidate.experience.length > 0
                ? candidate.experience.map((e) => `${e.designation} at ${e.company} (${e.startDate ? new Date(e.startDate).getFullYear() : ''} - ${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}): ${e.description || 'No description'}`).join("\n")
                : "None";

            const candidateEducationString = candidate.education && candidate.education.length > 0
                ? candidate.education.map((edu) => `${edu.degree} in ${edu.specialization || 'General'} from ${edu.institution} (Graduation: ${edu.graduationYear || 'N/A'})`).join("\n")
                : "None";

            const summaryNote = candidate.notes?.find((n) => n.content.startsWith("Resume Summary:\n"));
            const candidateSummaryString = summaryNote 
                ? summaryNote.content.replace("Resume Summary:\n", "").trim()
                : "None";

            let userPrompt = `
[CANDIDATE RESUME PROFILE]
Skills: ${candidateSkillsString}
Experience: ${candidateExperienceString}
Education: ${candidateEducationString}
Resume Summary: ${candidateSummaryString}
`;

            if (rawText) {
                userPrompt += `Resume Raw Text: ${rawText}\n`;
            }

            if (job) {
                const jobSkillsString = job.skills && job.skills.length > 0
                    ? job.skills.map((s) => s.skill.name).join(", ")
                    : "None";

                userPrompt += `
[JOB DETAILS]
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements || "None"}
Responsibilities: ${job.responsibilities || "None"}
Experience Min: ${job.experienceMin !== null ? job.experienceMin : "Not specified"} years
Experience Max: ${job.experienceMax !== null ? job.experienceMax : "Not specified"} years
Required Skills: ${jobSkillsString}
`;
            }

            if (extraContext) {
                userPrompt += `\n${extraContext.trim()}\n`;
            }

            return await aiOptimizationService.optimizeEvaluation<T>({
                candidate,
                job,
                promptConfig,
                userPrompt,
                schema,
                executeAi: async () => {
                    const prompt = PromptBuilder.build(promptConfig.template, userPrompt);
                    logger.info("Prompt Generated");

                    // Call AI Service
                    logger.info("AI Request Sent");
                    const response = await aiService.generate(prompt);
                    logger.info("AI Response Received");
                    logger.info(`AI Response Time: ${response.responseTime}ms`);

                    // Parse JSON
                    let parsedResponse: unknown;
                    try {
                        parsedResponse = JsonParser.parse<unknown>(response.content);
                    } catch (error) {
                        logger.error("AI Evaluation Failed: Invalid JSON", error);
                        throw new ValidationError("Failed to parse response from AI model as valid JSON.");
                    }

                    // Schema Validation
                    let validatedResponse: T;
                    try {
                        validatedResponse = schema.parse(parsedResponse);
                    } catch (error) {
                        logger.error("AI Evaluation Failed: Schema Failure", error);
                        throw error;
                    }
                    logger.info("Schema Validation Passed");

                    return validatedResponse;
                },
            });
        } catch (error) {
            logger.error("AI Evaluation Failed", error);
            throw error;
        }
    }
}

export const aiEvaluationService = new AiEvaluationService();
