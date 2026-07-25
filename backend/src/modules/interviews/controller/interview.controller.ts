import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { UnauthorizedError } from "../../../shared/errors";
import { successResponse } from "../../../shared/responses/success.response";
import { paginationResponse } from "../../../shared/responses/pagination.response";
import { INTERVIEW_MESSAGES } from "../constants/interview.constants";
import { interviewService } from "../service/interview.service";
import {
  CreateInterviewInput,
  UpdateInterviewInput,
  UpdateStatusInput,
  RescheduleInterviewInput,
  CancelInterviewInput,
  OutcomeInput,
  AssignInterviewersInput,
  InterviewQueryFilters,
} from "../types/interview.types";

export const interviewController = {
  scheduleInterview: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await interviewService.scheduleInterview(
      req.body as CreateInterviewInput,
      currentUser
    );

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_CREATED, result)
    );
  },

  listInterviews: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await interviewService.listInterviews(
      req.query as unknown as InterviewQueryFilters,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      paginationResponse(INTERVIEW_MESSAGES.INTERVIEWS_RETRIEVED, result.data, result.meta)
    );
  },

  getInterviewById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.getInterviewById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_RETRIEVED, result)
    );
  },

  updateInterview: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.updateInterview(
      id,
      req.body as UpdateInterviewInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_UPDATED, result)
    );
  },

  rescheduleInterview: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.rescheduleInterview(
      id,
      req.body as RescheduleInterviewInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_RESCHEDULED, result)
    );
  },

  cancelInterview: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.cancelInterview(
      id,
      req.body as CancelInterviewInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_CANCELLED, result)
    );
  },

  updateStatus: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.updateStatus(
      id,
      req.body as UpdateStatusInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_STATUS_UPDATED, result)
    );
  },

  recordOutcome: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.recordOutcome(
      id,
      req.body as OutcomeInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_OUTCOME_RECORDED, result)
    );
  },

  assignInterviewers: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await interviewService.assignInterviewers(
      id,
      req.body as AssignInterviewersInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEWERS_UPDATED, result)
    );
  },

  softDeleteInterview: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    await interviewService.softDeleteInterview(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(INTERVIEW_MESSAGES.INTERVIEW_DELETED)
    );
  },
};
