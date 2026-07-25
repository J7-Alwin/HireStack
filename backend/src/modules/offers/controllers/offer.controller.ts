import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../shared/constants/api.constants";
import { UnauthorizedError } from "../../../shared/errors";
import { successResponse } from "../../../shared/responses/success.response";
import { paginationResponse } from "../../../shared/responses/pagination.response";
import { OFFER_MESSAGES } from "../constants/offer.constants";
import { offerService } from "../services/offer.service";
import { CreateOfferInput, UpdateOfferInput, OfferQueryFilters } from "../types/offer.types";

export const offerController = {
  createOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await offerService.createOffer(
      req.body as CreateOfferInput,
      currentUser
    );

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(OFFER_MESSAGES.OFFER_CREATED, result)
    );
  },

  listOffers: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const result = await offerService.listOffers(
      req.query as unknown as OfferQueryFilters,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      paginationResponse(OFFER_MESSAGES.OFFERS_RETRIEVED, result.data, result.meta)
    );
  },

  getOfferById: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.getOfferById(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_RETRIEVED, result)
    );
  },

  updateDraft: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.updateDraft(
      id,
      req.body as UpdateOfferInput,
      currentUser
    );

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_UPDATED, result)
    );
  },

  submitForApproval: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.submitForApproval(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_SUBMITTED, result)
    );
  },

  approveOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.approveOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_APPROVED, result)
    );
  },

  sendOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.sendOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_SENT, result)
    );
  },

  markViewed: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.markViewed(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_VIEWED, result)
    );
  },

  acceptOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.acceptOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_ACCEPTED, result)
    );
  },

  declineOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.declineOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_DECLINED, result)
    );
  },

  withdrawOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.withdrawOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_WITHDRAWN, result)
    );
  },

  createOfferRevision: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    const result = await offerService.createOfferRevision(
      id,
      req.body as CreateOfferInput,
      currentUser
    );

    res.status(HTTP_STATUS.CREATED).json(
      successResponse(OFFER_MESSAGES.OFFER_REVISED, result)
    );
  },

  softDeleteOffer: async (req: Request, res: Response): Promise<void> => {
    const currentUser = req.user;
    if (!currentUser) throw new UnauthorizedError("Unauthenticated");

    const id = req.params.id as string;
    await offerService.softDeleteOffer(id, currentUser);

    res.status(HTTP_STATUS.OK).json(
      successResponse(OFFER_MESSAGES.OFFER_DELETED)
    );
  },
};
