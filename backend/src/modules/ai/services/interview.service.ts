import { prisma } from "../../../config/prisma";
import { Role, InterviewAssistantMode, InterviewAssistant, Prisma, ApplicationStatus } from "@prisma/client";
import { ValidationError, NotFoundError, ForbiddenError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { aiEvaluationService } from "./ai-evaluation.service";
import { INTERVIEW_PROMPT_CONFIG } from "../prompts/interview.prompt";
import {
    InterviewResponseSchema,
    GeneralInterviewRequestSchema,
    JobSpecificInterviewRequestSchema,
    GetInterviewHistoryParamsSchema,
    GetInterviewDetailsParamsSchema,
    InterviewResponseSchemaType,
} from "../schemas/interview.schema";
import {
    InterviewAssistantResponse,
    InterviewQuestion,
} from "../types/interview.types";
import { AI_CONFIG } from "../config";
import { logger } from "../../../shared/logger/logger";
import { SafeCandidate } from "../../candidates/candidate.types";
import { SafeJob } from "../../jobs/job.types";

export class InterviewService {
    /**
     * Generate General Interview Kit (no jobId)
     */
    async generateGeneralInterview(
        input: { candidateId: string },
        currentUser: AuthenticatedUser
    ): Promise<InterviewAssistantResponse> {
        logger.info(`Starting General Interview Kit generation for candidate ${input.candidateId}`);

        const parsedInput = GeneralInterviewRequestSchema.parse(input);
        const { candidateId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Evaluate via Shared AI Evaluation Service (job is undefined in general mode)
        const evaluated = await aiEvaluationService.evaluate<InterviewResponseSchemaType>(
            candidate,
            undefined,
            INTERVIEW_PROMPT_CONFIG,
            InterviewResponseSchema
        );

        // Business Validation & Mapping
        const questions: InterviewQuestion[] = evaluated.questions.map((q) => ({
            category: q.category,
            question: q.question,
            reason: q.reason,
            difficulty: q.difficulty,
            followUps: q.followUps || [],
        }));

        // Persist to Database
        const createdRecord = await prisma.interviewAssistant.create({
            data: {
                candidateId: candidate.id,
                jobId: null,
                mode: InterviewAssistantMode.GENERAL,
                overallSummary: evaluated.overallSummary,
                questions: questions as unknown as Prisma.InputJsonValue,
                aiModel: AI_CONFIG.model,
                promptVersion: INTERVIEW_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully saved general interview kit record ${createdRecord.id}`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode,
            overallSummary: createdRecord.overallSummary,
            questions,
            aiModel: createdRecord.aiModel,
            promptVersion: createdRecord.promptVersion,
            createdAt: createdRecord.createdAt.toISOString(),
            updatedAt: createdRecord.updatedAt.toISOString(),
        };
    }

    /**
     * Generate Job-Specific Interview Kit
     */
    async generateJobInterview(
        input: { candidateId: string; jobId: string },
        currentUser: AuthenticatedUser
    ): Promise<InterviewAssistantResponse> {
        logger.info(`Starting Job-Specific Interview Kit generation for candidate ${input.candidateId} against job ${input.jobId}`);

        const parsedInput = JobSpecificInterviewRequestSchema.parse(input);
        const { candidateId, jobId } = parsedInput;

        // Load & Authorize Candidate
        const candidate = await this.loadAndAuthorizeCandidate(candidateId, currentUser);

        // Validate resume presence & sufficient information
        this.validateResumeInfo(candidate);

        // Load & Authorize Job
        const job = await this.loadAndAuthorizeJob(jobId, candidate.id, candidate.companyId, currentUser);

        // Evaluate via Shared AI Evaluation Service
        const evaluated = await aiEvaluationService.evaluate<InterviewResponseSchemaType>(
            candidate,
            job,
            INTERVIEW_PROMPT_CONFIG,
            InterviewResponseSchema
        );

        // Business Validation & Mapping
        const questions: InterviewQuestion[] = evaluated.questions.map((q) => ({
            category: q.category,
            question: q.question,
            reason: q.reason,
            difficulty: q.difficulty,
            followUps: q.followUps || [],
        }));

        // Persist to Database
        const createdRecord = await prisma.interviewAssistant.create({
            data: {
                candidateId: candidate.id,
                jobId: job.id,
                mode: InterviewAssistantMode.JOB_SPECIFIC,
                overallSummary: evaluated.overallSummary,
                questions: questions as unknown as Prisma.InputJsonValue,
                aiModel: AI_CONFIG.model,
                promptVersion: INTERVIEW_PROMPT_CONFIG.version,
            },
        });

        logger.info(`Successfully saved job-specific interview kit record ${createdRecord.id}`);

        return {
            id: createdRecord.id,
            candidateId: createdRecord.candidateId,
            jobId: createdRecord.jobId,
            mode: createdRecord.mode,
            overallSummary: createdRecord.overallSummary,
            questions,
            aiModel: createdRecord.aiModel,
            promptVersion: createdRecord.promptVersion,
            createdAt: createdRecord.createdAt.toISOString(),
            updatedAt: createdRecord.updatedAt.toISOString(),
        };
    }

    /**
     * Get Candidate's Interview History
     */
    async getInterviewHistory(
        candidateId: string,
        currentUser: AuthenticatedUser
    ): Promise<Omit<InterviewAssistantResponse, "questions">[]> {
        logger.info(`Fetching interview history for candidate ${candidateId}`);

        const parsed = GetInterviewHistoryParamsSchema.parse({ candidateId });

        // Validate permissions on Candidate
        await this.loadAndAuthorizeCandidate(parsed.candidateId, currentUser);

        const whereClause: Prisma.InterviewAssistantWhereInput = { candidateId: parsed.candidateId };

        // Recruiter: Filter out unassigned JOB_SPECIFIC interview kits at query level
        if (currentUser.role === Role.RECRUITER) {
            whereClause.OR = [
                { mode: InterviewAssistantMode.GENERAL },
                {
                    mode: InterviewAssistantMode.JOB_SPECIFIC,
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

        const history = await prisma.interviewAssistant.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });

        return history.map((record: InterviewAssistant) => ({
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
     * Get Specific Interview Kit Details
     */
    async getInterviewDetails(
        id: string,
        currentUser: AuthenticatedUser
    ): Promise<InterviewAssistantResponse> {
        logger.info(`Fetching interview details for ID ${id}`);

        const parsed = GetInterviewDetailsParamsSchema.parse({ id });

        const record = await prisma.interviewAssistant.findUnique({
            where: { id: parsed.id },
        });

        if (!record) {
            throw new NotFoundError("Interview assistant kit not found.");
        }

        // Validate permissions on candidate profile linked to this record
        const candidate = await this.loadAndAuthorizeCandidate(record.candidateId, currentUser);

        // Recruiter/Job authorization check for JOB_SPECIFIC mode
        if (record.mode === InterviewAssistantMode.JOB_SPECIFIC && record.jobId) {
            // Load and authorize job to ensure recruiter is assigned and scoping is correct
            await this.loadAndAuthorizeJob(record.jobId, candidate.id, candidate.companyId, currentUser);
        }

        return {
            id: record.id,
            candidateId: record.candidateId,
            jobId: record.jobId,
            mode: record.mode,
            overallSummary: record.overallSummary,
            questions: record.questions as unknown as InterviewQuestion[],
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
                where: { id: candidateId, email: currentUser.email, isActive: true },
                include: {
                    skills: { include: { skill: true } },
                    education: true,
                    experience: true,
                    documents: true,
                    notes: true,
                },
            });
            if (!rawCandidate) {
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
        candidateId: string,
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
        if (currentUser.role === Role.CANDIDATE) {
            const hasApplication = await prisma.application.findFirst({
                where: {
                    candidateId,
                    jobId,
                    status: ApplicationStatus.ACTIVE,
                    deletedAt: null,
                },
            });
            if (!hasApplication) {
                throw new ForbiddenError("You can only request interview kits for jobs you have applied to.");
            }
        } else if (currentUser.role === Role.RECRUITER) {
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

export const interviewService = new InterviewService();
