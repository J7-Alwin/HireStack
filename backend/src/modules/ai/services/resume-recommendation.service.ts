import { prisma } from "../../../config/prisma";
import { Role } from "@prisma/client";
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
    ResumeRecommendationRequest,
    ResumeRecommendationItem
} from "../types/resume-recommendation.types";
import { AI_CONFIG } from "../config";
import { logger } from "../../../shared/logger/logger";

export class ResumeRecommendationService {
    /**
     * Generate General Resume Recommendations (no jobId)
     */
    async generateGeneralRecommendations(
        input: { candidateId: string },
        currentUser: AuthenticatedUser
    ): Promise<ResumeRecommendationResponse> {
        logger.info(`Starting General Resume Recommendations for candidate ${input.candidateId}`);

        // Validate Input Schema
        const parsedInput = GeneralRecommendationRequestSchema.parse(input);
        const { candidateId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Evaluate via Shared AI Evaluation Service
        const evaluated = await aiEvaluationService.evaluate<ResumeRecommendationSchemaType>(
            candidate,
            null, // No job context in General mode
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
        }));

        // Persist Recommendation in DB
        const createdRecord = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidate.id,
                mode: "GENERAL",
                overallSummary: evaluated.overallSummary,
                recommendations: JSON.parse(JSON.stringify(recommendations)),
                aiModel: AI_CONFIG.model,
                promptVersion: RESUME_RECOMMENDATION_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully stored General Resume Recommendation (ID: ${createdRecord.id})`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode as any,
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

        // Validate Input Schema
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
            job as any,
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
            jobRequirement: rec.jobRequirement,
        }));

        // Persist Recommendation in DB
        const createdRecord = await prisma.resumeRecommendation.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                mode: "JOB_SPECIFIC",
                overallSummary: evaluated.overallSummary,
                recommendations: JSON.parse(JSON.stringify(recommendations)),
                aiModel: AI_CONFIG.model,
                promptVersion: RESUME_RECOMMENDATION_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully stored Job-Specific Resume Recommendation (ID: ${createdRecord.id})`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode as any,
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

        const history = await prisma.resumeRecommendation.findMany({
            where: { candidateId },
            orderBy: { createdAt: "desc" },
        });

        return history.map((record: any) => ({
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            mode: record.mode as any,
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
        await this.loadAndAuthorizeCandidate(record.candidateId, currentUser);

        return {
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            mode: record.mode as any,
            overallSummary: record.overallSummary,
            recommendations: record.recommendations as any[],
            aiModel: record.aiModel,
            promptVersion: record.promptVersion,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        };
    }

    // ==========================================
    // HELPERS & AUTHORIZATION METHODS
    // ==========================================

    private async loadAndAuthorizeCandidate(candidateId: string, currentUser: AuthenticatedUser) {
        let candidate: any;

        if (currentUser.role === Role.CANDIDATE) {
            candidate = await prisma.candidate.findFirst({
                where: { email: currentUser.email, isActive: true },
                include: {
                    skills: { include: { skill: true } },
                    education: true,
                    experience: true,
                    documents: true,
                    notes: true,
                },
            });
            if (!candidate || candidate.id !== candidateId) {
                throw new ForbiddenError("You are not authorized to access this candidate's details");
            }
        } else if (currentUser.role === Role.COMPANY_ADMIN || currentUser.role === Role.RECRUITER) {
            candidate = await prisma.candidate.findFirst({
                where: { id: candidateId, companyId: currentUser.companyId!, isActive: true },
                include: {
                    skills: { include: { skill: true } },
                    education: true,
                    experience: true,
                    documents: true,
                    notes: true,
                },
            });
            if (!candidate) {
                throw new NotFoundError("Candidate not found.");
            }
        } else {
            throw new ForbiddenError("You do not have permission to perform this action");
        }

        return candidate;
    }

    private async loadAndAuthorizeJob(jobId: string, candidateCompanyId: string, currentUser: AuthenticatedUser) {
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
            const isAssigned = job.recruiters.some((r: any) => r.recruiterId === currentUser.id);
            if (!isAssigned) {
                throw new ForbiddenError("You do not have permission to access this job.");
            }
        } else if (currentUser.role === Role.COMPANY_ADMIN) {
            if (job.companyId !== currentUser.companyId) {
                throw new ForbiddenError("Cross-company access is forbidden");
            }
        }

        return job;
    }

    private validateResumeInfo(candidate: any) {
        // Validate Parsed Resume presence
        const resumeDoc = candidate.documents?.find(
            (doc: any) => doc.documentType === "RESUME" && doc.isActive
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
