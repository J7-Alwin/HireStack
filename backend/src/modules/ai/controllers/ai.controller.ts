import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { successResponse } from "../../../shared/responses/success.response";
import { resumeParserService } from "../services/resume-parser.service";
import { aiService } from "../services/ai.service";
import { atsScoreService } from "../services/ats-score.service";
import { jobMatchingService } from "../services/job-matching.service";
import { ValidationError, UnauthorizedError } from "../../../shared/errors";

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
};