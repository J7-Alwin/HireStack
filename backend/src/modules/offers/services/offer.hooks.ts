import { logger } from "../../../shared/logger/logger";
import { OfferDto } from "../types/offer.dto";

export const offerHooks = {
  onOfferCreated: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Created", {
      event: "OfferCreated",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferApproved: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Approved", {
      event: "OfferApproved",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferSent: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Sent", {
      event: "OfferSent",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferViewed: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Viewed", {
      event: "OfferViewed",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferAccepted: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Accepted", {
      event: "OfferAccepted",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferDeclined: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Declined", {
      event: "OfferDeclined",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferWithdrawn: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Withdrawn", {
      event: "OfferWithdrawn",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },

  onOfferExpired: async (offer: OfferDto, userId: string): Promise<void> => {
    logger.info("Domain Event: Offer Expired", {
      event: "OfferExpired",
      offerId: offer.id,
      offerCode: offer.offerCode,
      companyId: offer.companyId,
      applicationId: offer.applicationId,
      userId,
      status: offer.status,
      timestamp: new Date().toISOString(),
    });
  },
};
