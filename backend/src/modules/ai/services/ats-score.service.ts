import { prisma } from "../../../config/prisma";
import { candidateService } from "../../candidates/candidate.service";
import { jobService } from "../../jobs/job.service";
import { logger } from "../../../shared/logger/logger";
import { ValidationError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { aiEvaluationService } from "./ai-evaluation.service";
import { ATS_SCORE_PROMPT_CONFIG } from "../prompts/ats-score.prompt";
import { AtsScoreSchema, AtsScoreRequestSchema } from "../schemas/ats-score.schema";
import { ATSScoreResponse, ATSScoreRequest } from "../types/ats.types";
import { AI_CONFIG } from "../config";

export class AtsScoreService {
    async calculateATSScore(
        input: ATSScoreRequest,
        currentUser: AuthenticatedUser
    ): Promise<ATSScoreResponse> {
        // Validate Request Body
        const parsedInput = AtsScoreRequestSchema.parse(input);
        return this.evaluateCandidateJob(parsedInput.candidateId, parsedInput.jobId, currentUser);
    }

    async evaluateCandidateJob(
        candidateId: string,
        jobId: string,
        currentUser: AuthenticatedUser
    ): Promise<ATSScoreResponse> {
        logger.info("ATS Started");

        try {
            // Load Candidate
            const candidate = await candidateService.getCandidateById(
                candidateId,
                currentUser
            );
            logger.info("Candidate Loaded");

            // Validate Parsed Resume
            const resumeDoc = candidate.documents?.find(
                (doc) => doc.documentType === "RESUME" && doc.isActive
            );
            if (!resumeDoc) {
                const error = new ValidationError("Candidate resume is missing.");
                logger.error("ATS Scoring Failed: Resume Missing", error);
                throw error;
            }

            // Verify Resume Sufficient Info
            const hasSufficientInfo =
                (candidate.skills && candidate.skills.length > 0) ||
                (candidate.experience && candidate.experience.length > 0) ||
                (candidate.education && candidate.education.length > 0);

            if (!hasSufficientInfo) {
                const error = new ValidationError("Resume contains insufficient information for evaluation.");
                logger.error("ATS Scoring Failed: Resume contains insufficient information", error);
                throw error;
            }

            // Load Job
            const job = await jobService.getJobById(jobId, currentUser);
            logger.info("Job Loaded");

            // Validate Job Description
            if (!job.description || !job.description.trim()) {
                const error = new ValidationError("Job description is missing.");
                logger.error("ATS Scoring Failed: Job description is missing", error);
                throw error;
            }

            // Evaluate candidate using shared AI evaluation service
            const validatedResponse = await aiEvaluationService.evaluate<ATSScoreResponse>(
                candidate,
                job,
                ATS_SCORE_PROMPT_CONFIG,
                AtsScoreSchema
            );

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
                    overallReason: validatedResponse.overallReason,
                    aiModel: AI_CONFIG.model,
                    promptVersion: ATS_SCORE_PROMPT_CONFIG.version,
                },
            });
            logger.info("ATS Stored");
            logger.info("ATS Completed");

            return validatedResponse;
        } catch (error) {
            logger.error("ATS Scoring Failed", error);
            throw error;
        }
    }
}

export const atsScoreService = new AtsScoreService();

