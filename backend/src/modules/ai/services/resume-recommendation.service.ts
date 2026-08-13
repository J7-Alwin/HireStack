import { prisma } from "../../../config/prisma";
import { Role, ResumeRecommendationMode, ResumeRecommendation, Prisma } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { aiEvaluationService } from "./ai-evaluation.service";
import { RESUME_RECOMMENDATION_PROMPT_CONFIG } from "../prompts/resume-recommendation.prompt";
import {
    ResumeRecommendationSchema,
    GeneralRecommendationRequestSchema,
    JobSpecificRecommendationRequestSchema,
    ResumeRecommendationSchemaType
} from "../schemas/resume-recommendation.schema";
import {
    ResumeRecommendationResponse,
    ResumeRecommendationItem
} from "../types/resume-recommendation.types";
import { AI_CONFIG } from "../config";
import { logger } from "../../../shared/logger/logger";
import { SafeCandidate } from "../../candidates/candidate.types";
import { SafeJob } from "../../jobs/job.types";

export class ResumeRecommendationService {
    /**
     * Generate General Resume Recommendations (no jobId)
     */
    async generateGeneralRecommendations(
        input: { candidateId: string },
        currentUser: AuthenticatedUser
    ): Promise<ResumeRecommendationResponse> {
        logger.info(`Starting General Resume Recommendations for candidate ${input.candidateId}`);

        const parsedInput = GeneralRecommendationRequestSchema.parse(input);
        const { candidateId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Evaluate via Shared AI Evaluation Service (job is undefined in general mode)
        const evaluated = await aiEvaluationService.evaluate<ResumeRecommendationSchemaType>(
            candidate,
            undefined,
            RESUME_RECOMMENDATION_PROMPT_CONFIG,
            ResumeRecommendationSchema
        );

        // Business Validation & Mapping
        const recommendations: ResumeRecommendationItem[] = evaluated.recommendations.map((rec) => ({
            category: rec.category,
            priority: rec.priority,
            currentIssue: rec.currentIssue,
            recommendation: rec.recommendation,
            reason: rec.reason,
            evidence: rec.evidence || "",
            expectedImprovement: rec.expectedImprovement,
            jobRequirement: undefined,
        }));

        // Persist to Database
        const createdRecord = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidate.id,
                mode: ResumeRecommendationMode.GENERAL,
                overallSummary: evaluated.overallSummary,
                recommendations: recommendations as unknown as Prisma.InputJsonValue,
                aiModel: AI_CONFIG.model,
                promptVersion: RESUME_RECOMMENDATION_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully saved general recommendations record ${createdRecord.id}`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode,
            overallSummary: createdRecord.overallSummary,
            recommendations: recommendations,
            aiModel: createdRecord.aiModel,
            promptVersion: createdRecord.promptVersion,
            createdAt: createdRecord.createdAt.toISOString(),
            updatedAt: createdRecord.updatedAt.toISOString(),
        };
    }

    /**
     * Generate Job-Specific Resume Recommendations
     */
    async generateJobRecommendations(
        input: { candidateId: string; jobId: string },
        currentUser: AuthenticatedUser
    ): Promise<ResumeRecommendationResponse> {
        logger.info(`Starting Job-Specific Resume Recommendations for candidate ${input.candidateId} against job ${input.jobId}`);

        const parsedInput = JobSpecificRecommendationRequestSchema.parse(input);
        const { candidateId, jobId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Load & Authorize Job
        const job = await this.loadAndAuthorizeJob(jobId, candidate.companyId, currentUser);

        // Evaluate via Shared AI Evaluation Service
        const evaluated = await aiEvaluationService.evaluate<ResumeRecommendationSchemaType>(
            candidate,
            job,
            RESUME_RECOMMENDATION_PROMPT_CONFIG,
            ResumeRecommendationSchema
        );

        // Business Validation & Mapping
        const recommendations: ResumeRecommendationItem[] = evaluated.recommendations.map((rec) => ({
            category: rec.category,
            priority: rec.priority,
            currentIssue: rec.currentIssue,
            recommendation: rec.recommendation,
            reason: rec.reason,
            evidence: rec.evidence || "",
            expectedImprovement: rec.expectedImprovement,
            jobRequirement: rec.jobRequirement || undefined,
        }));

        // Persist to Database
        const createdRecord = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                mode: ResumeRecommendationMode.JOB_SPECIFIC,
                overallSummary: evaluated.overallSummary,
                recommendations: recommendations as unknown as Prisma.InputJsonValue,
                aiModel: AI_CONFIG.model,
                promptVersion: RESUME_RECOMMENDATION_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully saved job-specific recommendations record ${createdRecord.id}`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode,
            overallSummary: createdRecord.overallSummary,
            recommendations: recommendations,
            aiModel: createdRecord.aiModel,
            promptVersion: createdRecord.promptVersion,
            createdAt: createdRecord.createdAt.toISOString(),
            updatedAt: createdRecord.updatedAt.toISOString(),
        };
    }

    /**
     * Get Candidate's Recommendation History
     */
    async getRecommendationsHistory(
        candidateId: string,
        currentUser: AuthenticatedUser
    ): Promise<Omit<ResumeRecommendationResponse, "recommendations">[]> {
        logger.info(`Fetching recommendations history for candidate ${candidateId}`);

        // Validate permissions on Candidate
        await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        const whereClause: Prisma.ResumeRecommendationWhereInput = { candidateId };

        // Recruiter: Filter out unassigned JOB_SPECIFIC recommendations at query level
        if (currentUser.role === Role.RECRUITER) {
            whereClause.OR = [
                { mode: ResumeRecommendationMode.GENERAL },
                {
                    mode: ResumeRecommendationMode.JOB_SPECIFIC,
                    job: {
                        recruiters: {
                            some: {
                                recruiterId: currentUser.id,
                            },
                        },
                    },
                },
            ];
        }

        const history = await prisma.resumeRecommendation.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return history.map((record: ResumeRecommendation) => ({
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            mode: record.mode,
            overallSummary: record.overallSummary,
            aiModel: record.aiModel,
            promptVersion: record.promptVersion,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        }));
    }

    /**
     * Get Specific Recommendation Details
     */
    async getRecommendationDetails(
        id: string,
        currentUser: AuthenticatedUser
    ): Promise<ResumeRecommendationResponse> {
        logger.info(`Fetching recommendation details for ID ${id}`);

        const record = await prisma.resumeRecommendation.findUnique({
            where: { id },
        });

        if (!record) {
            throw new NotFoundError("Resume recommendation not found.");
        }

        // Validate permissions on candidate profile linked to this record
        const candidate = await this.loadAndAuthorizeCandidate(record.candidateId, currentUser);

        // Recruiter/Job authorization check for JOB_SPECIFIC mode
        if (record.mode === ResumeRecommendationMode.JOB_SPECIFIC) {
            if (!record.jobId) {
                throw new ValidationError("Job ID is missing for job-specific recommendation.");
            }
            // Load and authorize job to ensure recruiter is assigned and scoping is correct
            await this.loadAndAuthorizeJob(record.jobId, candidate.companyId, currentUser);
        }

        return {
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            mode: record.mode,
            overallSummary: record.overallSummary,
            recommendations: record.recommendations as unknown as ResumeRecommendationItem[],
            aiModel: record.aiModel,
            promptVersion: record.promptVersion,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        };
    }

    // ==========================================
    // HELPERS & AUTHORIZATION METHODS
    // ==========================================

    private async loadAndAuthorizeCandidate(
        candidateId: string,
        currentUser: AuthenticatedUser
    ): Promise<SafeCandidate> {
        if (currentUser.role === Role.CANDIDATE) {
            const rawCandidate = await prisma.candidate.findFirst({
                where: { email: currentUser.email, isActive: true },
                include: {
                    skills: { include: { skill: true } },
                    education: true,
                    experience: true,
                    documents: true,
                    notes: true,
                },
            });
            if (!rawCandidate || rawCandidate.id !== candidateId) {
                throw new ForbiddenError("You are not authorized to access this candidate's details");
            }
            return rawCandidate as unknown as SafeCandidate;
        }

        if (currentUser.role === Role.COMPANY_ADMIN || currentUser.role === Role.RECRUITER) {
            const rawCandidate = await prisma.candidate.findFirst({
                where: { id: candidateId, companyId: currentUser.companyId!, isActive: true },
                include: {
                    skills: { include: { skill: true } },
                    education: true,
                    experience: true,
                    documents: true,
                    notes: true,
                },
            });
            if (!rawCandidate) {
                throw new NotFoundError("Candidate not found.");
            }
            return rawCandidate as unknown as SafeCandidate;
        }

        throw new ForbiddenError("You do not have permission to perform this action");
    }

    private async loadAndAuthorizeJob(
        jobId: string,
        candidateCompanyId: string,
        currentUser: AuthenticatedUser
    ): Promise<SafeJob> {
        const job = await prisma.job.findFirst({
            where: { id: jobId, isActive: true },
            include: {
                skills: { include: { skill: true } },
                recruiters: true,
            },
        });

        if (!job) {
            throw new NotFoundError("Job not found.");
        }

        // Verify company scoping
        if (job.companyId !== candidateCompanyId) {
            throw new ForbiddenError("Cross-company access is forbidden");
        }

        // Role-based restrictions
        if (currentUser.role === Role.RECRUITER) {
            if (job.companyId !== currentUser.companyId) {
                throw new ForbiddenError("Cross-company access is forbidden");
            }
            const isAssigned = job.recruiters.some((r) => r.recruiterId === currentUser.id);
            if (!isAssigned) {
                throw new ForbiddenError("You do not have permission to access this job.");
            }
        } else if (currentUser.role === Role.COMPANY_ADMIN) {
            if (job.companyId !== currentUser.companyId) {
                throw new ForbiddenError("Cross-company access is forbidden");
            }
        }

        return job as unknown as SafeJob;
    }

    private validateResumeInfo(candidate: SafeCandidate): void {
        // Validate Parsed Resume presence
        const resumeDoc = candidate.documents?.find(
            (doc) => doc.documentType === "RESUME" && doc.isActive
        );
        if (!resumeDoc) {
            throw new ValidationError("Candidate resume is missing.");
        }

        // Verify Resume has Sufficient Info
        const hasSufficientInfo =
            (candidate.skills && candidate.skills.length > 0) ||
            (candidate.experience && candidate.experience.length > 0) ||
            (candidate.education && candidate.education.length > 0);

        if (!hasSufficientInfo) {
            throw new ValidationError("Resume contains insufficient information for evaluation.");
        }
    }
}

export const resumeRecommendationService = new ResumeRecommendationService();
