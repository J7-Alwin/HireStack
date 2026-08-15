import { prisma } from "../../../config/prisma";
import { Role, Prisma, AiInsight, ResumeRecommendationMode } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { aiEvaluationService } from "./ai-evaluation.service";
import { INSIGHTS_PROMPT_CONFIG } from "../prompts/insights.prompt";
import {
    GenerateAiInsightsSchema,
    GetInsightsHistoryParamsSchema,
    GetInsightsDetailsParamsSchema,
    AiInsightResponseSchema,
    AiInsightResponseSchemaType,
} from "../schemas/insights.schema";
import {
    AiInsightResponse,
    AiInsightHistoryItem,
} from "../types/insights.types";
import { AI_CONFIG } from "../config";
import { logger } from "../../../shared/logger/logger";
import { SafeCandidate } from "../../candidates/candidate.types";
import { SafeJob } from "../../jobs/job.types";

export class AiInsightsService {
    /**
     * Generate AI Insights for candidate and job.
     * Note: In Version 1.0, AI Insights is strictly Job-Specific and requires both candidateId and jobId.
     */
    async generateInsights(
        input: { candidateId: string; jobId: string },
        currentUser: AuthenticatedUser
    ): Promise<AiInsightResponse> {
        logger.info(`Starting AI Insights generation for candidate ${input.candidateId} against job ${input.jobId}`);

        const parsedInput = GenerateAiInsightsSchema.parse(input);
        const { candidateId, jobId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Load & Authorize Job
        const job = await this.loadAndAuthorizeJob(jobId, candidate.id, candidate.companyId, currentUser);

        // Load existing AI evaluations strictly scoped to candidateId and jobId
        const [atsScore, jobMatch, resumeRec] = await Promise.all([
            prisma.aTSScore.findFirst({
                where: { candidateId: candidate.id, jobId: job.id },
                orderBy: { createdAt: "desc" },
            }),
            prisma.jobMatch.findFirst({
                where: { candidateId: candidate.id, jobId: job.id },
                orderBy: { createdAt: "desc" },
            }),
            prisma.resumeRecommendation.findFirst({
                where: {
                    candidateId: candidate.id,
                    jobId: job.id,
                    mode: ResumeRecommendationMode.JOB_SPECIFIC,
                },
                orderBy: { createdAt: "desc" },
            }),
        ]);

        // Construct existing evaluations context
        let extraContext = "[EXISTING AI EVALUATIONS]\n";
        let hasAnyEvaluation = false;

        if (atsScore) {
            hasAnyEvaluation = true;
            extraContext += `ATS Score: Overall Score: ${atsScore.overallScore}, Skill Score: ${atsScore.skillScore}, Experience Score: ${atsScore.experienceScore}, Education Score: ${atsScore.educationScore}, Recommendations: ${JSON.stringify(atsScore.recommendations)}\n`;
        }

        if (jobMatch) {
            hasAnyEvaluation = true;
            extraContext += `Job Matching: Match Percentage: ${jobMatch.matchPercentage}%, Skill Match: ${jobMatch.skillMatch}%, Experience Match: ${jobMatch.experienceMatch}%, Missing Skills: ${JSON.stringify(jobMatch.missingSkills)}, Recommendation: ${jobMatch.recommendation}\n`;
        }

        if (resumeRec) {
            hasAnyEvaluation = true;
            extraContext += `Resume Recommendations: Mode: ${resumeRec.mode}, Summary: ${resumeRec.overallSummary}, Recommendations: ${JSON.stringify(resumeRec.recommendations)}\n`;
        }

        if (!hasAnyEvaluation) {
            extraContext += "No prior ATS, Job Match, or Resume Recommendation evaluations exist for this candidate/job. Proceed with direct profile and job analysis.\n";
        }

        // Evaluate via Shared AI Evaluation Service
        const evaluated = await aiEvaluationService.evaluate<AiInsightResponseSchemaType>(
            candidate,
            job,
            INSIGHTS_PROMPT_CONFIG,
            AiInsightResponseSchema,
            extraContext
        );

        // Business Validation
        if (evaluated.hiringConfidence < 0 || evaluated.hiringConfidence > 100) {
            throw new ValidationError("Hiring confidence must be between 0 and 100.");
        }

        if (!evaluated.overallInsight || evaluated.overallInsight.trim().length === 0) {
            throw new ValidationError("Overall insight cannot be empty.");
        }

        if (!evaluated.recommendation || evaluated.recommendation.trim().length === 0) {
            throw new ValidationError("Recommendation cannot be empty.");
        }

        // Persist to Database
        const createdRecord = await prisma.aiInsight.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                overallInsight: evaluated.overallInsight,
                strengths: evaluated.strengths as unknown as Prisma.InputJsonValue,
                weaknesses: evaluated.weaknesses as unknown as Prisma.InputJsonValue,
                skillGaps: evaluated.skillGaps as unknown as Prisma.InputJsonValue,
                experienceConcerns: evaluated.experienceConcerns as unknown as Prisma.InputJsonValue,
                hiringRisks: evaluated.hiringRisks as unknown as Prisma.InputJsonValue,
                hiringConfidence: evaluated.hiringConfidence,
                jobFitObservations: evaluated.jobFitObservations as unknown as Prisma.InputJsonValue,
                recruiterFocusAreas: evaluated.recruiterFocusAreas as unknown as Prisma.InputJsonValue,
                recommendation: evaluated.recommendation,
                aiModel: AI_CONFIG.model,
                promptVersion: INSIGHTS_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully saved AI insight record ${createdRecord.id}`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            overallInsight: createdRecord.overallInsight,
            strengths: evaluated.strengths,
            weaknesses: evaluated.weaknesses,
            skillGaps: evaluated.skillGaps,
            experienceConcerns: evaluated.experienceConcerns,
            hiringRisks: evaluated.hiringRisks,
            hiringConfidence: createdRecord.hiringConfidence,
            jobFitObservations: evaluated.jobFitObservations,
            recruiterFocusAreas: evaluated.recruiterFocusAreas,
            recommendation: createdRecord.recommendation,
            aiModel: createdRecord.aiModel,
            promptVersion: createdRecord.promptVersion,
            createdAt: createdRecord.createdAt.toISOString(),
            updatedAt: createdRecord.updatedAt.toISOString(),
        };
    }

    /**
     * Get Candidate's AI Insights History
     */
    async getInsightsHistory(
        candidateId: string,
        currentUser: AuthenticatedUser
    ): Promise<AiInsightHistoryItem[]> {
        logger.info(`Fetching AI Insights history for candidate ${candidateId}`);

        const parsed = GetInsightsHistoryParamsSchema.parse({ candidateId });

        // Validate permissions on Candidate
        await this.loadAndAuthorizeCandidate(parsed.candidateId, currentUser);

        const whereClause: Prisma.AiInsightWhereInput = { candidateId: parsed.candidateId };

        // Recruiter: Only show insights for active jobs assigned to this recruiter.
        // Insights for deleted jobs (jobId: null) or unassigned jobs are strictly excluded.
        if (currentUser.role === Role.RECRUITER) {
            whereClause.job = {
                recruiters: {
                    some: {
                        recruiterId: currentUser.id,
                    },
                },
            };
        }

        const history = await prisma.aiInsight.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return history.map((record: AiInsight) => ({
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            overallInsight: record.overallInsight,
            hiringConfidence: record.hiringConfidence,
            recommendation: record.recommendation,
            aiModel: record.aiModel,
            promptVersion: record.promptVersion,
            createdAt: record.createdAt.toISOString(),
            updatedAt: record.updatedAt.toISOString(),
        }));
    }

    /**
     * Get Specific AI Insight Details
     */
    async getInsightsDetails(
        id: string,
        currentUser: AuthenticatedUser
    ): Promise<AiInsightResponse> {
        logger.info(`Fetching AI insight details for ID ${id}`);

        const parsed = GetInsightsDetailsParamsSchema.parse({ id });

        const record = await prisma.aiInsight.findUnique({
            where: { id: parsed.id },
        });

        if (!record) {
            throw new NotFoundError("AI Insight not found.");
        }

        // Validate permissions on candidate profile linked to this record (multi-tenant company check)
        const candidate = await this.loadAndAuthorizeCandidate(record.candidateId, currentUser);

        // For Recruiter: Enforce active job assignment. Deleted jobs (jobId: null) or unassigned jobs are forbidden.
        if (currentUser.role === Role.RECRUITER) {
            if (!record.jobId) {
                throw new ForbiddenError("You do not have permission to access insights for a deleted job.");
            }
            await this.loadAndAuthorizeJob(record.jobId, candidate.id, candidate.companyId, currentUser);
        } else if (record.jobId) {
            // For Company Admin: Verify job company scoping if jobId is present
            await this.loadAndAuthorizeJob(record.jobId, candidate.id, candidate.companyId, currentUser);
        }

        return {
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            overallInsight: record.overallInsight,
            strengths: record.strengths as unknown as string[],
            weaknesses: record.weaknesses as unknown as string[],
            skillGaps: record.skillGaps as unknown as string[],
            experienceConcerns: record.experienceConcerns as unknown as string[],
            hiringRisks: record.hiringRisks as unknown as string[],
            hiringConfidence: record.hiringConfidence,
            jobFitObservations: record.jobFitObservations as unknown as string[],
            recruiterFocusAreas: record.recruiterFocusAreas as unknown as string[],
            recommendation: record.recommendation,
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
        _candidateId: string,
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
        if (job.companyId !== candidateCompanyId || job.companyId !== currentUser.companyId) {
            throw new ForbiddenError("Cross-company access is forbidden");
        }

        // Recruiter role assignment check
        if (currentUser.role === Role.RECRUITER) {
            const isAssigned = job.recruiters.some((r) => r.recruiterId === currentUser.id);
            if (!isAssigned) {
                throw new ForbiddenError("You do not have permission to access this job.");
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

export const aiInsightsService = new AiInsightsService();
