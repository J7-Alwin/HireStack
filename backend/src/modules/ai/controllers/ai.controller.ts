import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { successResponse } from "../../../shared/responses/success.response";
import { resumeParserService } from "../services/resume-parser.service";

export const aiController = {
    // Existing healthCheck...

    parseResume: async (req: Request, res: Response): Promise<void> => {
        if (!req.file) {
            res
                .status(HTTP_STATUS.BAD_REQUEST)
                .json(successResponse("Resume PDF is required"));

            return;
        }

        const result = await resumeParserService.parseResume(req.file.buffer);

        res
            .status(HTTP_STATUS.OK)
            .json(successResponse("Resume parsed successfully", result));
    },
};