import {
  Role,
  OfferStatus,
  Prisma,
  PipelineStage,
  PipelineTimelineEventType,
} from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ForbiddenError, ConflictError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { logger } from "../../../shared/logger/logger";
import { OFFER_MESSAGES } from "../constants/offer.constants";
import { offerRepository } from "../repositories/offer.repository";
import { CreateOfferInput, UpdateOfferInput, OfferQueryFilters } from "../types/offer.types";
import { createOfferSchema, updateOfferSchema, queryOffersSchema } from "../validation";
import { paginationHelper } from "../../../shared/pagination/pagination.helper";
import { OfferStateMachine } from "./offer.state-machine";
import {
  enforceWriterRole,
  getOfferAndValidateAccess,
  ensureOfferExists,
  ensureOfferNotDeleted,
  ensureOfferEditable,
  ensureApplicationEligible,
  validateOfferAccess,
  verifyNoImmutableFields,
  validateDateBounds,
  validateCompanyAccess,
} from "./business-rules/offer-rules";
import { offerHooks } from "./offer.hooks";

export const offerService = {
  createOffer: async (input: CreateOfferInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createOfferSchema.parse(input);
    validateDateBounds(parsedInput.joiningDate, parsedInput.expiryDate);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Verify parent Application exists, belongs to company, and is ACTIVE
        const application = await offerRepository.findActiveApplication(
          parsedInput.applicationId,
          tx
        );
        ensureApplicationEligible(application, companyId);

        // If recruiter, check they are the assigned recruiter
        if (
          currentUser.role === Role.RECRUITER &&
          application!.assignedRecruiterId !== currentUser.id
        ) {
          throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_MODIFICATION);
        }

        // 2. Block if another active offer exists on this application
        const activeOffer = await offerRepository.findActiveOfferByApplication(
          parsedInput.applicationId,
          tx
        );
        if (activeOffer) {
          throw new ConflictError(OFFER_MESSAGES.DUPLICATE_ACTIVE_OFFER);
        }

        // 3. Generate sequential offer code inside transaction with FOR UPDATE lock
        const counter = await offerRepository.incrementOfferCounter(companyId, tx);
        const offerCode = `OFF-${String(counter).padStart(6, "0")}`;

        return await offerRepository.createOffer(
          companyId,
          offerCode,
          1,
          application!.candidateId,
          parsedInput,
          currentUser.id,
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Created", {
      action: "Offer Created",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferCreated(result, currentUser.id);

    return result;
  },

  updateDraft: async (id: string, input: UpdateOfferInput, currentUser: AuthenticatedUser) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = updateOfferSchema.parse(input);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await getOfferAndValidateAccess(id, currentUser, tx);

        ensureOfferEditable(offer);

        // Enforce date bounds if both or one date is changed
        const updatedJoin = parsedInput.joiningDate || offer.joiningDate;
        const updatedExpiry = parsedInput.expiryDate || offer.expiryDate;
        if (parsedInput.joiningDate || parsedInput.expiryDate) {
          validateDateBounds(updatedJoin, updatedExpiry);
        }

        return await offerRepository.updateOffer(
          id,
          {
            salary: parsedInput.salary,
            currency: parsedInput.currency,
            employmentType: parsedInput.employmentType,
            joiningDate: parsedInput.joiningDate ? new Date(parsedInput.joiningDate) : undefined,
            expiryDate: parsedInput.expiryDate ? new Date(parsedInput.expiryDate) : undefined,
            benefits: parsedInput.benefits,
            notes: parsedInput.notes,
            offerLetterUrl: parsedInput.offerLetterUrl,
            offerLetterFileName: parsedInput.offerLetterFileName,
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Updated", {
      action: "Offer Updated",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  submitForApproval: async (id: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await getOfferAndValidateAccess(id, currentUser, tx);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.PENDING_APPROVAL;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        return await offerRepository.updateOffer(id, { status: nextStatus }, tx);
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Submitted for Approval", {
      action: "Offer Submitted for Approval",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  approveOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await getOfferAndValidateAccess(id, currentUser, tx);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.APPROVED;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        const updated = await offerRepository.approveOffer(id, currentUser.id, new Date(), tx);

        // Auto update pipeline
        const pipeline = await tx.hiringPipeline.findFirst({
          where: { applicationId: offer.applicationId, deletedAt: null },
        });
        if (pipeline && !pipeline.isCompleted) {
          await tx.hiringPipeline.update({
            where: { id: pipeline.id },
            data: {
              currentStage: PipelineStage.OFFER_PENDING,
              previousStage: pipeline.currentStage,
              stageOrder: 7,
              stageChangedAt: new Date(),
            },
          });
          await tx.pipelineHistory.create({
            data: {
              pipelineId: pipeline.id,
              fromStage: pipeline.currentStage,
              toStage: PipelineStage.OFFER_PENDING,
              movedById: currentUser.id,
              reason: "Offer Approved",
              comments: `Offer code ${offer.offerCode} was approved by Company Admin.`,
            },
          });
          await tx.pipelineTimeline.create({
            data: {
              pipelineId: pipeline.id,
              eventType: PipelineTimelineEventType.OFFER_PENDING,
              title: "Offer Approved (Pending Candidate Review)",
              description: `The employment offer (${offer.offerCode}) has been approved and is pending release.`,
              createdById: currentUser.id,
            },
          });
        }

        return updated;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Approved", {
      action: "Offer Approved",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferApproved(result, currentUser.id);

    return result;
  },

  sendOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await getOfferAndValidateAccess(id, currentUser, tx);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.SENT;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        const updated = await offerRepository.sendOffer(id, new Date(), tx);

        // Auto update pipeline
        const pipeline = await tx.hiringPipeline.findFirst({
          where: { applicationId: offer.applicationId, deletedAt: null },
        });
        if (pipeline && !pipeline.isCompleted) {
          await tx.hiringPipeline.update({
            where: { id: pipeline.id },
            data: {
              currentStage: PipelineStage.OFFER_SENT,
              previousStage: pipeline.currentStage,
              stageOrder: 8,
              stageChangedAt: new Date(),
            },
          });
          await tx.pipelineHistory.create({
            data: {
              pipelineId: pipeline.id,
              fromStage: pipeline.currentStage,
              toStage: PipelineStage.OFFER_SENT,
              movedById: currentUser.id,
              reason: "Offer Sent",
              comments: `Offer code ${offer.offerCode} was officially released to candidate.`,
            },
          });
          await tx.pipelineTimeline.create({
            data: {
              pipelineId: pipeline.id,
              eventType: PipelineTimelineEventType.OFFER_SENT,
              title: "Offer Sent to Candidate",
              description: `The offer letter (${offer.offerCode}) has been officially sent out to the candidate.`,
              createdById: currentUser.id,
            },
          });
        }

        return updated;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Sent", {
      action: "Offer Sent",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferSent(result, currentUser.id);

    return result;
  },

  markViewed: async (id: string, currentUser: AuthenticatedUser) => {
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await ensureOfferExists(id, false, tx);
        ensureOfferNotDeleted(offer);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.VIEWED;

        if (currentStatus === nextStatus) {
          return offer;
        }

        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        return await offerRepository.updateOffer(
          id,
          {
            status: nextStatus,
            viewedAt: new Date(),
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Viewed", {
      action: "Offer Viewed",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferViewed(result, currentUser.id);

    return result;
  },

  acceptOffer: async (id: string, currentUser: AuthenticatedUser) => {
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await ensureOfferExists(id, false, tx);
        ensureOfferNotDeleted(offer);
        validateOfferAccess(offer, currentUser);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.ACCEPTED;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        // Check for expiry bounds dynamically
        if (new Date() > new Date(offer.expiryDate)) {
          const expiredOffer = await offerRepository.updateOffer(
            id,
            { status: OfferStatus.EXPIRED },
            tx
          );
          await offerHooks.onOfferExpired(expiredOffer, currentUser.id);
          throw new ConflictError("Offer has expired and cannot be accepted");
        }

        const updated = await offerRepository.updateOffer(
          id,
          {
            status: nextStatus,
            respondedAt: new Date(),
          },
          tx
        );

        // Auto update pipeline
        const pipeline = await tx.hiringPipeline.findFirst({
          where: { applicationId: offer.applicationId, deletedAt: null },
        });
        if (pipeline && !pipeline.isCompleted) {
          await tx.hiringPipeline.update({
            where: { id: pipeline.id },
            data: {
              currentStage: PipelineStage.OFFER_ACCEPTED,
              previousStage: pipeline.currentStage,
              stageOrder: 9,
              stageChangedAt: new Date(),
            },
          });
          await tx.pipelineHistory.create({
            data: {
              pipelineId: pipeline.id,
              fromStage: pipeline.currentStage,
              toStage: PipelineStage.OFFER_ACCEPTED,
              movedById: currentUser.id,
              reason: "Offer Accepted",
              comments: `Offer code ${offer.offerCode} accepted by candidate.`,
            },
          });
          await tx.pipelineTimeline.create({
            data: {
              pipelineId: pipeline.id,
              eventType: PipelineTimelineEventType.OFFER_ACCEPTED,
              title: "Offer Accepted by Candidate",
              description: `Candidate accepted offer letter (${offer.offerCode}).`,
              createdById: currentUser.id,
            },
          });
        }

        return updated;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Accepted", {
      action: "Offer Accepted",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferAccepted(result, currentUser.id);

    return result;
  },

  declineOffer: async (id: string, currentUser: AuthenticatedUser) => {
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await ensureOfferExists(id, false, tx);
        ensureOfferNotDeleted(offer);
        validateOfferAccess(offer, currentUser);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.DECLINED;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        return await offerRepository.updateOffer(
          id,
          {
            status: nextStatus,
            respondedAt: new Date(),
          },
          tx
        );
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Declined", {
      action: "Offer Declined",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferDeclined(result, currentUser.id);

    return result;
  },

  withdrawOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await getOfferAndValidateAccess(id, currentUser, tx);

        const currentStatus = offer.status;
        const nextStatus = OfferStatus.WITHDRAWN;
        OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

        return await offerRepository.withdrawOffer(id, tx);
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Withdrawn", {
      action: "Offer Withdrawn",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferWithdrawn(result, currentUser.id);

    return result;
  },

  createOfferRevision: async (
    id: string,
    input: CreateOfferInput,
    currentUser: AuthenticatedUser
  ) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createOfferSchema.parse(input);
    validateDateBounds(parsedInput.joiningDate, parsedInput.expiryDate);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Lock current active version row in database (Row-level lock)
        await offerRepository.lockOfferRow(id, tx);

        // 2. Fetch current offer in transaction context
        const oldOffer = await getOfferAndValidateAccess(id, currentUser, tx);

        if (oldOffer.status === OfferStatus.ACCEPTED) {
          throw new ConflictError("Accepted offers are immutable and cannot be revised");
        }

        // Verify revision applicationId matches original
        if (oldOffer.applicationId !== parsedInput.applicationId) {
          throw new ConflictError("Revision application ID does not match original offer");
        }

        // Check if application is ACTIVE
        const application = await offerRepository.findActiveApplication(
          parsedInput.applicationId,
          tx
        );
        ensureApplicationEligible(application, companyId);

        // If recruiter, check they are the assigned recruiter
        if (
          currentUser.role === Role.RECRUITER &&
          application!.assignedRecruiterId !== currentUser.id
        ) {
          throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_MODIFICATION);
        }

        // Check existing active offers other than the one being revised
        const activeOffer = await offerRepository.findActiveOfferByApplication(
          parsedInput.applicationId,
          tx
        );
        if (activeOffer && activeOffer.id !== id) {
          throw new ConflictError(OFFER_MESSAGES.DUPLICATE_ACTIVE_OFFER);
        }

        // 3. Create new version record under the SAME offerCode
        const newOffer = await offerRepository.createRevision(
          companyId,
          oldOffer.offerCode,
          oldOffer.version + 1,
          oldOffer.candidateId,
          parsedInput,
          currentUser.id,
          tx
        );

        // 4. Supersede old active offer by updating its status to WITHDRAWN
        if (
          oldOffer.status === OfferStatus.DRAFT ||
          oldOffer.status === OfferStatus.PENDING_APPROVAL ||
          oldOffer.status === OfferStatus.APPROVED ||
          oldOffer.status === OfferStatus.SENT ||
          oldOffer.status === OfferStatus.VIEWED
        ) {
          await offerRepository.withdrawOffer(id, tx);
        }

        return newOffer;
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Revised", {
      action: "Offer Revised",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    await offerHooks.onOfferCreated(result, currentUser.id);

    return result;
  },

  getOfferById: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }
    const offer = await ensureOfferExists(id);
    ensureOfferNotDeleted(offer);
    validateCompanyAccess(offer.companyId, currentUser);
    return offer;
  },

  listOffers: async (query: OfferQueryFilters, currentUser: AuthenticatedUser) => {
    if (currentUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }
    const companyId = currentUser.companyId!;
    const parsedQuery = queryOffersSchema.parse(query);

    const { skip, take } = paginationHelper.getPrismaOptions({
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    const result = await offerRepository.findOffersMany(companyId, parsedQuery, skip, take);
    const meta = paginationHelper.createMeta(result.total, {
      page: parsedQuery.page,
      limit: parsedQuery.limit,
    });

    return {
      data: result.data,
      meta,
    };
  },

  softDeleteOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const offer = await ensureOfferExists(id, false, tx);
        ensureOfferNotDeleted(offer);
        validateCompanyAccess(offer.companyId, currentUser);

        // Accepted offers are immutable and cannot be deleted
        if (offer.status === OfferStatus.ACCEPTED) {
          throw new ConflictError("Accepted offers are immutable and cannot be deleted");
        }

        return await offerRepository.softDeleteOffer(id, tx);
      },
      {
        timeout: 20000,
      }
    );

    logger.info("Offer Deleted", {
      action: "Offer Deleted",
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

    return result;
  },
};
