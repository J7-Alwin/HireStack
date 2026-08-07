import { prisma } from "../../../config/prisma";
import { candidateService } from "../../candidates/candidate.service";
import { jobService } from "../../jobs/job.service";
import { logger } from "../../../shared/logger/logger";
import { ValidationError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { PromptBuilder } from "../utils/prompt-builder";
import { JsonParser } from "../utils/json-parser";
import { aiService } from "./ai.service";
import { ATS_SCORE_PROMPT_CONFIG } from "../prompts/ats-score.prompt";
import { AtsScoreSchema, AtsScoreRequestSchema } from "../schemas/ats-score.schema";
import { ATSScoreResponse, ATSScoreRequest } from "../types/ats.types";
import { AI_CONFIG } from "../config";

export class AtsScoreService {
    async calculateATSScore(
        input: ATSScoreRequest,
        currentUser: AuthenticatedUser
    ): Promise<ATSScoreResponse> {
        logger.info("ATS Scoring Started");

        try {
            // Validate Request Body
            const parsedInput = AtsScoreRequestSchema.parse(input);

            // Load Candidate
            const candidate = await candidateService.getCandidateById(
                parsedInput.candidateId,
                currentUser
            );
            logger.info("Candidate Loaded");

            // Validate Parsed Resume
            const resumeDoc = candidate.documents?.find(
                (doc) => doc.documentType === "RESUME" && doc.isActive
            );
            if (!resumeDoc) {
                logger.error("ATS Scoring Failed");
                throw new ValidationError("Candidate resume is missing.");
            }

            // Verify Resume Sufficient Info
            const hasSufficientInfo =
                (candidate.skills && candidate.skills.length > 0) ||
                (candidate.experience && candidate.experience.length > 0) ||
                (candidate.education && candidate.education.length > 0);

            if (!hasSufficientInfo) {
                logger.error("ATS Scoring Failed");
                throw new ValidationError("Resume contains insufficient information for evaluation.");
            }

            // Load Job
            const job = await jobService.getJobById(parsedInput.jobId, currentUser);
            logger.info("Job Loaded");

            // Validate Job Description
            if (!job.description || !job.description.trim()) {
                logger.error("ATS Scoring Failed");
                throw new ValidationError("Job description is missing.");
            }

            // Build ATS Prompt
            const candidateSkillsString = candidate.skills && candidate.skills.length > 0
                ? candidate.skills.map((s) => `${s.skill.name} (${s.proficiency || 'Intermediate'})`).join(", ")
                : "None";

            const candidateExperienceString = candidate.experience && candidate.experience.length > 0
                ? candidate.experience.map((e) => `${e.designation} at ${e.company} (${e.startDate ? new Date(e.startDate).getFullYear() : ''} - ${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'}): ${e.description || 'No description'}`).join("\n")
                : "None";

            const candidateEducationString = candidate.education && candidate.education.length > 0
                ? candidate.education.map((edu) => `${edu.degree} in ${edu.specialization || 'General'} from ${edu.institution} (Graduation: ${edu.graduationYear || 'N/A'})`).join("\n")
                : "None";

            const candidateSummaryString = candidate.notes && candidate.notes.length > 0
                ? candidate.notes.map((n) => n.content).join("\n")
                : "None";

            const jobSkillsString = job.skills && job.skills.length > 0
                ? job.skills.map((s) => s.skill.name).join(", ")
                : "None";

            const userPrompt = `
[CANDIDATE RESUME PROFILE]
Skills: ${candidateSkillsString}
Experience: ${candidateExperienceString}
Education: ${candidateEducationString}
Documents/Summary: ${candidateSummaryString}

[JOB DETAILS]
Title: ${job.title}
Description: ${job.description}
Requirements: ${job.requirements || "None"}
Responsibilities: ${job.responsibilities || "None"}
Experience Min: ${job.experienceMin !== null ? job.experienceMin : "Not specified"} years
Experience Max: ${job.experienceMax !== null ? job.experienceMax : "Not specified"} years
Required Skills: ${jobSkillsString}
`;

            const prompt = PromptBuilder.build(ATS_SCORE_PROMPT_CONFIG.template, userPrompt);
            logger.info("Prompt Generated");

            // Call AI Service
            logger.info("AI Request Sent");
            const response = await aiService.generate(prompt);
            logger.info("AI Response Received");
            logger.info(`AI Response Time: ${response.responseTime}ms`);

            // Parse JSON
            let parsedResponse: any;
            try {
                parsedResponse = JsonParser.parse<any>(response.content);
            } catch (error) {
                logger.error("ATS Scoring Failed");
                throw new ValidationError("Failed to parse response from AI model as valid JSON.");
            }

            // Schema Validation
            let validatedResponse: ATSScoreResponse;
            try {
                validatedResponse = AtsScoreSchema.parse(parsedResponse);
            } catch (error) {
                logger.error("ATS Scoring Failed");
                throw error;
            }
            logger.info("Schema Validation Passed");

            // Persist ATS Score
            await prisma.aTSScore.create({
                data: {
                    candidateId: candidate.id,
                    jobId: job.id,
                    overallScore: validatedResponse.overallScore,
                    skillScore: validatedResponse.skillScore,
                    experienceScore: validatedResponse.experienceScore,
                    educationScore: validatedResponse.educationScore,
                    keywordScore: validatedResponse.keywordScore,
                    certificationScore: validatedResponse.certificationScore,
                    strengths: validatedResponse.strengths,
                    weaknesses: validatedResponse.weaknesses,
                    missingSkills: validatedResponse.missingSkills,
                    recommendations: validatedResponse.recommendations,
                    hiringRecommendation: validatedResponse.hiringRecommendation,
                    aiModel: AI_CONFIG.model,
                    promptVersion: ATS_SCORE_PROMPT_CONFIG.version,
                },
            });
            logger.info("ATS Score Stored");
            logger.info("ATS Scoring Completed");

            return validatedResponse;
        } catch (error) {
            logger.error("ATS Scoring Failed");
            throw error;
        }
    }
}

export const atsScoreService = new AtsScoreService();
