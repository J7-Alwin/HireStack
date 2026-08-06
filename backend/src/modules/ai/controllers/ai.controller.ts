import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { successResponse } from "../../../shared/responses/success.response";
import { resumeParserService } from "../services/resume-parser.service";
import { aiService } from "../services/ai.service";
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
};