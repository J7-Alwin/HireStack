import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { UnauthorizedError } from "../../../shared/errors";
import { successResponse } from "../../../shared/responses/success.response";
import { paginationResponse } from "../../../shared/responses/pagination.response";
import { pipelineService } from "../services/pipeline.service";
import {
  CreatePipelineInput,
  MoveStageInput,
  AddNotesInput,
  PipelineQueryFilters,
} from "../types/pipeline.types";

export const pipelineController = {
  createPipeline: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await pipelineService.createPipeline(
      req.body as CreatePipelineInput,
      currentUser
    );

    res
      .status(HTTP_STATUS.CREATED)
      .json(successResponse("Hiring pipeline created successfully", result));
  },

  listPipelines: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await pipelineService.listPipelines(
      req.query as unknown as PipelineQueryFilters,
      currentUser
    );

    res
      .status(HTTP_STATUS.OK)
      .json(paginationResponse("Pipelines retrieved successfully", result.data, result.meta));
  },

  getPipelineById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.getPipelineById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse("Pipeline retrieved successfully", result));
  },

  moveStage: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.moveStage(id, req.body as MoveStageInput, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse("Pipeline stage updated successfully", result));
  },

  addNotes: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.addNotes(id, req.body as AddNotesInput, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse("Pipeline notes updated successfully", result));
  },

  getHistory: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.getHistory(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Pipeline stage history retrieved successfully", result));
  },

  getTimeline: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.getTimeline(id, currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Pipeline activity timeline retrieved successfully", result));
  },

  getDashboardSummary: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await pipelineService.getDashboardSummary(currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Dashboard metrics summary retrieved successfully", result));
  },

  getCompanyDashboard: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await pipelineService.getCompanyDashboard(currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Company dashboard statistics retrieved successfully", result));
  },

  getRecruiterDashboard: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await pipelineService.getRecruiterDashboard(currentUser);

    res
      .status(HTTP_STATUS.OK)
      .json(successResponse("Recruiter dashboard statistics retrieved successfully", result));
  },

  softDeletePipeline: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await pipelineService.softDeletePipeline(id, currentUser);

    res.status(HTTP_STATUS.OK).json(successResponse("Pipeline soft-deleted successfully", result));
  },
};
