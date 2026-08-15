import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { successResponse } from "../../../shared/responses/success.response";
import { resumeParserService } from "../services/resume-parser.service";
import { aiService } from "../services/ai.service";
import { atsScoreService } from "../services/ats-score.service";
import { jobMatchingService } from "../services/job-matching.service";
import { resumeRecommendationService } from "../services/resume-recommendation.service";
import { interviewService } from "../services/interview.service";
import { aiInsightsService } from "../services/ai-insights.service";
import { ValidationError, UnauthorizedError } from "../../../shared/errors";
import { GetHistoryParamsSchema, GetDetailsParamsSchema } from "../schemas/resume-recommendation.schema";
import { GetInterviewHistoryParamsSchema, GetInterviewDetailsParamsSchema } from "../schemas/interview.schema";
import { GetInsightsHistoryParamsSchema, GetInsightsDetailsParamsSchema } from "../schemas/insights.schema";

export const aiController = {
    healthCheck: async (req: Request, res: Response): Promise<void> => {
        const health = await aiService.healthCheck();
        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("AI service health checked successfully", health));
    },

    parseResume: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        if (!req.file) {
            throw new ValidationError("Resume PDF is required");
        }

        const result = await resumeParserService.parseResume(req.file, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Resume parsed and candidate created successfully", result));
    },

    atsScore: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await atsScoreService.calculateATSScore(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("ATS score generated successfully.", result));
    },

    generateJobMatching: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await jobMatchingService.generateJobMatching(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Job matching generated successfully.", result));
    },

    getJobMatchingHistory: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await jobMatchingService.getJobMatchingHistory(req.params.jobId as string, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Job matching history retrieved successfully.", result));
    },

    getCandidateMatchDetails: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await jobMatchingService.getCandidateMatchDetails(
            req.params.jobId as string,
            req.params.candidateId as string,
            currentUser
        );

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Candidate match details retrieved successfully.", result));
    },

    generateGeneralRecommendations: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await resumeRecommendationService.generateGeneralRecommendations(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("General resume recommendations generated successfully.", result));
    },

    generateJobRecommendations: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await resumeRecommendationService.generateJobRecommendations(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Job-specific resume recommendations generated successfully.", result));
    },

    getRecommendationsHistory: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetHistoryParamsSchema.parse(req.params);
        const result = await resumeRecommendationService.getRecommendationsHistory(params.candidateId, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Resume recommendations history retrieved successfully.", result));
    },

    getRecommendationDetails: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetDetailsParamsSchema.parse(req.params);
        const result = await resumeRecommendationService.getRecommendationDetails(params.id, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Resume recommendation details retrieved successfully.", result));
    },

    generateGeneralInterview: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await interviewService.generateGeneralInterview(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("General interview kit generated successfully.", result));
    },

    generateJobInterview: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await interviewService.generateJobInterview(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Job-specific interview kit generated successfully.", result));
    },

    getInterviewHistory: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetInterviewHistoryParamsSchema.parse(req.params);
        const result = await interviewService.getInterviewHistory(params.candidateId, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Interview history retrieved successfully.", result));
    },

    getInterviewDetails: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetInterviewDetailsParamsSchema.parse(req.params);
        const result = await interviewService.getInterviewDetails(params.id, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Interview kit details retrieved successfully.", result));
    },

    generateInsights: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const result = await aiInsightsService.generateInsights(req.body, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("AI insights generated successfully.", result));
    },

    getInsightsHistory: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetInsightsHistoryParamsSchema.parse(req.params);
        const result = await aiInsightsService.getInsightsHistory(params.candidateId, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("AI insights history retrieved successfully.", result));
    },

    getInsightsDetails: async (req: Request, res: Response): Promise<void> => {
        const currentUser = req.user;
        if (!currentUser) {
            throw new UnauthorizedError("Unauthenticated");
        }

        const params = GetInsightsDetailsParamsSchema.parse(req.params);
        const result = await aiInsightsService.getInsightsDetails(params.id, currentUser);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("AI insight details retrieved successfully.", result));
    },
};