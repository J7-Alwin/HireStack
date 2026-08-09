import { prisma } from "../../../config/prisma";
import { candidateService } from "../../candidates/candidate.service";
import { jobService } from "../../jobs/job.service";
import { applicationRepository } from "../../applications/application.repository";
import { logger } from "../../../shared/logger/logger";
import { ValidationError, NotFoundError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { aiEvaluationService } from "./ai-evaluation.service";
import { JOB_MATCHING_PROMPT_CONFIG } from "../prompts/job-matching.prompt";
import { JobMatchingSchema } from "../schemas/job-matching.schema";
import {
    JobMatchingResponse,
    JobMatchingRequest,
    JobMatchingAIResponse,
    JobMatchDetailsResponse,
    CandidateMatchResponse
} from "../types/job-matching.types";
import { AI_CONFIG } from "../config";

export class JobMatchingService {
    async generateJobMatching(
        input: JobMatchingRequest,
        currentUser: AuthenticatedUser
    ): Promise<JobMatchingResponse> {
        logger.info("Job Matching Started");

        try {
            const { jobId } = input;

            // Load Job and verify permissions
            const job = await jobService.getJobById(jobId, currentUser);
            logger.info(`Job Loaded (${job.id})`);

            // Validate Job description
            if (!job.description || !job.description.trim()) {
                throw new ValidationError("Job description is missing.");
            }

            // Load all applications for the job
            const applicationsResult = await applicationRepository.findMany(
                currentUser.companyId!,
                { job: jobId },
                0,
                1000
            );
            const applications = applicationsResult.data;
            logger.info("Applications Loaded");

            const matches: CandidateMatchResponse[] = [];

            // Loop through each applicant candidate
            for (const app of applications) {
                try {
                    logger.info(`Candidate Loaded (${app.candidateId})`);
                    logger.info(`Evaluation Started for candidate ${app.candidateId}`);

                    const candidate = await candidateService.getCandidateById(
                        app.candidateId,
                        currentUser
                    );

                    // Validate resume document
                    const resumeDoc = candidate.documents?.find(
                        (doc) => doc.documentType === "RESUME" && doc.isActive
                    );
                    if (!resumeDoc) {
                        throw new ValidationError("Candidate resume is missing.");
                    }

                    // Verify resume sufficient information
                    const hasSufficientInfo =
                        (candidate.skills && candidate.skills.length > 0) ||
                        (candidate.experience && candidate.experience.length > 0) ||
                        (candidate.education && candidate.education.length > 0);

                    if (!hasSufficientInfo) {
                        throw new ValidationError("Resume contains insufficient information for evaluation.");
                    }

                    // Evaluate candidate using shared AI evaluation service
                    const evaluation = await aiEvaluationService.evaluate<JobMatchingAIResponse>(
                        candidate,
                        job,
                        JOB_MATCHING_PROMPT_CONFIG,
                        JobMatchingSchema
                    );
                    logger.info(`Evaluation Completed for candidate ${app.candidateId}`);

                    // Persist new JobMatch record in the database
                    await prisma.jobMatch.create({
                        data: {
                            jobId: job.id,
                            candidateId: candidate.id,
                            matchPercentage: evaluation.matchPercentage,
                            skillMatch: evaluation.skillMatch,
                            experienceMatch: evaluation.experienceMatch,
                            educationMatch: evaluation.educationMatch,
                            projectMatch: evaluation.projectMatch,
                            keywordMatch: evaluation.keywordMatch,
                            strengths: evaluation.strengths,
                            missingSkills: evaluation.missingSkills,
                            overallReason: evaluation.overallReason,
                            recommendation: evaluation.recommendation,
                            aiModel: AI_CONFIG.model,
                            promptVersion: JOB_MATCHING_PROMPT_CONFIG.version,
                        },
                    });
                    logger.info(`JobMatch Stored (${evaluation.matchPercentage})`);

                    matches.push({
                        candidateId: candidate.id,
                        candidateName: `${candidate.firstName} ${candidate.lastName}`,
                        matchPercentage: evaluation.matchPercentage,
                        recommendation: evaluation.recommendation,
                    });
                    logger.info(`Candidate Matching Complete (${candidate.id})`);
                } catch (error) {
                    logger.error(`Candidate matching failed for candidate ${app.candidateId}`, error);
                    // Do not stop looping, continue to the next candidate
                }
            }

            // Sort ranking by match percentage descending
            matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
            logger.info("Ranking Complete");
            logger.info("Job Matching Completed");

            return {
                jobId: job.id,
                totalCandidates: matches.length,
                generatedAt: new Date().toISOString(),
                matches,
            };
        } catch (error) {
            logger.error("Job Matching Failed", error);
            throw error;
        }
    }

    async getJobMatchingHistory(
        jobId: string,
        currentUser: AuthenticatedUser
    ): Promise<JobMatchDetailsResponse[]> {
        // Verify Job exists and permissions
        const job = await jobService.getJobById(jobId, currentUser);

        const history = await prisma.jobMatch.findMany({
            where: { jobId: job.id },
            include: {
                candidate: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return history.map((h) => ({
            id: h.id,
            jobId: h.jobId,
            candidateId: h.candidateId,
            candidateName: `${h.candidate.firstName} ${h.candidate.lastName}`,
            matchPercentage: h.matchPercentage,
            skillMatch: h.skillMatch,
            experienceMatch: h.experienceMatch,
            educationMatch: h.educationMatch,
            projectMatch: h.projectMatch,
            keywordMatch: h.keywordMatch,
            strengths: h.strengths as string[],
            missingSkills: h.missingSkills as string[],
            overallReason: h.overallReason,
            recommendation: h.recommendation as any,
            aiModel: h.aiModel,
            promptVersion: h.promptVersion,
            createdAt: h.createdAt.toISOString(),
            updatedAt: h.updatedAt.toISOString(),
        }));
    }

    async getCandidateMatchDetails(
        jobId: string,
        candidateId: string,
        currentUser: AuthenticatedUser
    ): Promise<JobMatchDetailsResponse> {
        // Verify Job exists and permissions
        const job = await jobService.getJobById(jobId, currentUser);

        // Verify Candidate exists and permissions
        const candidate = await candidateService.getCandidateById(candidateId, currentUser);

        // Load latest job match
        const match = await prisma.jobMatch.findFirst({
            where: { jobId: job.id, candidateId: candidate.id },
            orderBy: { createdAt: "desc" },
        });

        if (!match) {
            throw new NotFoundError("Job match not found.");
        }

        return {
            id: match.id,
            jobId: match.jobId,
            candidateId: match.candidateId,
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            matchPercentage: match.matchPercentage,
            skillMatch: match.skillMatch,
            experienceMatch: match.experienceMatch,
            educationMatch: match.educationMatch,
            projectMatch: match.projectMatch,
            keywordMatch: match.keywordMatch,
            strengths: match.strengths as string[],
            missingSkills: match.missingSkills as string[],
            overallReason: match.overallReason,
            recommendation: match.recommendation as any,
            aiModel: match.aiModel,
            promptVersion: match.promptVersion,
            createdAt: match.createdAt.toISOString(),
            updatedAt: match.updatedAt.toISOString(),
        };
    }
}

export const jobMatchingService = new JobMatchingService();
