import { Role, OfferStatus, Prisma, ApplicationStatus } from "@prisma/client";
import { prisma } from "../../../config/prisma";
import { ForbiddenError, NotFoundError, ConflictError, ValidationError } from "../../../shared/errors";
import { AuthenticatedUser } from "../../../shared/types";
import { logger } from "../../../shared/logger/logger";
import { OFFER_MESSAGES } from "../constants/offer.constants";
import { offerRepository } from "../repositories/offer.repository";
import { CreateOfferInput, UpdateOfferInput, OfferQueryFilters } from "../types/offer.types";
import { createOfferSchema, updateOfferSchema, queryOffersSchema } from "../validation";
import { paginationHelper } from "../../../shared/pagination/pagination.helper";
import { OfferStateMachine } from "./offer.state-machine";
import { OfferDto } from "../types/offer.dto";

// Company and user access scopes
function validateCompanyAccess(entityCompanyId: string, currentUser: AuthenticatedUser) {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (entityCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(OFFER_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

function enforceWriterRole(currentUser: AuthenticatedUser) {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
  }
}

// Business rule helpers
async function ensureOfferExists(id: string, includeDeleted = false, tx?: Prisma.TransactionClient): Promise<OfferDto> {
  const offer = await offerRepository.findById(id, includeDeleted, tx);
  if (!offer) {
    throw new NotFoundError(OFFER_MESSAGES.OFFER_NOT_FOUND);
  }
  return offer;
}

function ensureOfferNotDeleted(offer: OfferDto) {
  if (offer.deletedAt) {
    throw new NotFoundError(OFFER_MESSAGES.OFFER_NOT_FOUND);
  }
}

function ensureOfferBelongsToCompany(offer: OfferDto, companyId: string) {
  if (offer.companyId !== companyId) {
    throw new ForbiddenError(OFFER_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

function validateOfferAccess(offer: OfferDto, currentUser: AuthenticatedUser) {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
  }
  ensureOfferBelongsToCompany(offer, currentUser.companyId!);

  // Recruiter rule: Recruiters can only modify offers they created or if they are assigned to the application
  if (currentUser.role === Role.RECRUITER) {
    const isOwner = offer.recruiterId === currentUser.id;
    const isAssigned = offer.application?.assignedRecruiterId === currentUser.id;
    if (!isOwner && !isAssigned) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_MODIFICATION);
    }
  }
}

async function getOfferAndValidateAccess(id: string, currentUser: AuthenticatedUser, tx?: Prisma.TransactionClient): Promise<OfferDto> {
  const offer = await ensureOfferExists(id, false, tx);
  validateOfferAccess(offer, currentUser);
  return offer;
}

function ensureOfferEditable(offer: OfferDto) {
  if (offer.status !== OfferStatus.DRAFT) {
    throw new ConflictError(OFFER_MESSAGES.ONLY_DRAFT_EDITABLE);
  }
}

function ensureApplicationEligible(
  application: { companyId: string; status: string } | null,
  companyId: string
) {
  if (!application) {
    throw new NotFoundError("Application not found");
  }
  if (application.companyId !== companyId) {
    throw new ForbiddenError(OFFER_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
  if (application.status !== ApplicationStatus.ACTIVE) {
    throw new ConflictError(OFFER_MESSAGES.APPLICATION_NOT_ELIGIBLE);
  }
}

function verifyNoImmutableFields(body: unknown) {
  const immutableFields = ["offerCode", "companyId", "applicationId", "candidateId", "version", "createdAt"];
  for (const field of immutableFields) {
    if (body && typeof body === "object" && field in body) {
      throw new ValidationError(OFFER_MESSAGES.IMMUTABLE_FIELD_UPDATE);
    }
  }
}

function validateDateBounds(joiningDateStr: string, expiryDateStr: string) {
  const join = new Date(joiningDateStr);
  const expiry = new Date(expiryDateStr);
  const now = new Date();

  // Joining Date not in past (date component only)
  const todayStart = new Date(now.setHours(0, 0, 0, 0));
  if (join < todayStart) {
    throw new ValidationError(OFFER_MESSAGES.JOINING_DATE_PAST);
  }

  // Expiry Date after today (strictly > end of today)
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  if (expiry <= todayEnd) {
    throw new ValidationError(OFFER_MESSAGES.EXPIRY_DATE_PAST);
  }

  // Expiry Date before joining date
  if (expiry >= join) {
    throw new ValidationError(OFFER_MESSAGES.EXPIRY_BEFORE_JOINING);
  }
}

export const offerService = {
  createOffer: async (input: CreateOfferInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createOfferSchema.parse(input);
    validateDateBounds(parsedInput.joiningDate, parsedInput.expiryDate);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Verify parent Application exists, belongs to company, and is ACTIVE
      const application = await offerRepository.findActiveApplication(parsedInput.applicationId, tx);
      ensureApplicationEligible(application, companyId);

      // If recruiter, check they are the assigned recruiter
      if (currentUser.role === Role.RECRUITER && application!.assignedRecruiterId !== currentUser.id) {
        throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_MODIFICATION);
      }

      // 2. Block if another active offer exists on this application
      const activeOffer = await offerRepository.findActiveOfferByApplication(parsedInput.applicationId, tx);
      if (activeOffer) {
        throw new ConflictError(OFFER_MESSAGES.DUPLICATE_ACTIVE_OFFER);
      }

      // 3. Generate sequential offer code inside transaction with FOR UPDATE lock
      const counter = await offerRepository.incrementOfferCounter(companyId, tx);
      const offerCode = `OFF-${String(counter).padStart(6, "0")}`;

      return await offerRepository.create(
        companyId,
        offerCode,
        1,
        application!.candidateId,
        parsedInput,
        currentUser.id,
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Scheduled", {
      interviewId: undefined, // Matches structured log fields schema
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Created",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  updateDraft: async (id: string, input: UpdateOfferInput, currentUser: AuthenticatedUser) => {
    verifyNoImmutableFields(input);
    enforceWriterRole(currentUser);

    const parsedInput = updateOfferSchema.parse(input);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await getOfferAndValidateAccess(id, currentUser, tx);

      ensureOfferEditable(offer);

      // Enforce date bounds if both or one date is changed
      const updatedJoin = parsedInput.joiningDate || offer.joiningDate;
      const updatedExpiry = parsedInput.expiryDate || offer.expiryDate;
      if (parsedInput.joiningDate || parsedInput.expiryDate) {
        validateDateBounds(updatedJoin, updatedExpiry);
      }

      return await offerRepository.update(
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
    }, {
      timeout: 20000,
    });

    logger.info("Offer Updated", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Updated",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  submitForApproval: async (id: string, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await getOfferAndValidateAccess(id, currentUser, tx);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.PENDING_APPROVAL;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        { status: nextStatus },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Submitted", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Submitted",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  approveOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await getOfferAndValidateAccess(id, currentUser, tx);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.APPROVED;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        {
          status: nextStatus,
          approvedBy: currentUser.id,
          approvedAt: new Date(),
        },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Approved", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Approved",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  sendOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await getOfferAndValidateAccess(id, currentUser, tx);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.SENT;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        {
          status: nextStatus,
          sentAt: new Date(),
        },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Sent", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Sent",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  markViewed: async (id: string, currentUser: AuthenticatedUser) => {
    // Both Candidate, Recruiter or Admin can trigger this (e.g. tracking opens)
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await ensureOfferExists(id, false, tx);
      ensureOfferNotDeleted(offer);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.VIEWED;

      if (currentStatus === nextStatus) {
        return offer;
      }

      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        {
          status: nextStatus,
          viewedAt: new Date(),
        },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Viewed", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Viewed",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  acceptOffer: async (id: string, currentUser: AuthenticatedUser) => {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await ensureOfferExists(id, false, tx);
      ensureOfferNotDeleted(offer);
      validateOfferAccess(offer, currentUser);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.ACCEPTED;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      // Check for expiry bounds dynamically
      if (new Date() > new Date(offer.expiryDate)) {
        await offerRepository.update(id, { status: OfferStatus.EXPIRED }, tx);
        throw new ConflictError("Offer has expired and cannot be accepted");
      }

      return await offerRepository.update(
        id,
        {
          status: nextStatus,
          respondedAt: new Date(),
        },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Accepted", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Accepted",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  declineOffer: async (id: string, currentUser: AuthenticatedUser) => {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await ensureOfferExists(id, false, tx);
      ensureOfferNotDeleted(offer);
      validateOfferAccess(offer, currentUser);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.DECLINED;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        {
          status: nextStatus,
          respondedAt: new Date(),
        },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Declined", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Declined",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  withdrawOffer: async (id: string, currentUser: AuthenticatedUser) => {
    if (currentUser.role !== Role.COMPANY_ADMIN) {
      throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await getOfferAndValidateAccess(id, currentUser, tx);

      const currentStatus = offer.status;
      const nextStatus = OfferStatus.WITHDRAWN;
      OfferStateMachine.throwIfInvalidTransition(currentStatus, nextStatus);

      return await offerRepository.update(
        id,
        { status: nextStatus },
        tx
      );
    }, {
      timeout: 20000,
    });

    logger.info("Offer Withdrawn", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Withdrawn",
      timestamp: new Date().toISOString(),
    });

    return result;
  },

  createOfferRevision: async (id: string, input: CreateOfferInput, currentUser: AuthenticatedUser) => {
    enforceWriterRole(currentUser);
    const companyId = currentUser.companyId!;

    const parsedInput = createOfferSchema.parse(input);
    validateDateBounds(parsedInput.joiningDate, parsedInput.expiryDate);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Lock current active version row in database (Row-level lock)
      await offerRepository.lock(id, tx);

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
      const application = await offerRepository.findActiveApplication(parsedInput.applicationId, tx);
      ensureApplicationEligible(application, companyId);

      // If recruiter, check they are the assigned recruiter
      if (currentUser.role === Role.RECRUITER && application!.assignedRecruiterId !== currentUser.id) {
        throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_MODIFICATION);
      }

      // Check existing active offers other than the one being revised
      const activeOffer = await offerRepository.findActiveOfferByApplication(parsedInput.applicationId, tx);
      if (activeOffer && activeOffer.id !== id) {
        throw new ConflictError(OFFER_MESSAGES.DUPLICATE_ACTIVE_OFFER);
      }

      // 3. Create new version record under the SAME offerCode
      const newOffer = await offerRepository.create(
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
        await offerRepository.update(id, { status: OfferStatus.WITHDRAWN }, tx);
      }

      return newOffer;
    }, {
      timeout: 20000,
    });

    logger.info("Offer Revised", {
      offerId: result.id,
      offerCode: result.offerCode,
      companyId: result.companyId,
      applicationId: result.applicationId,
      userId: currentUser.id,
      operation: "Offer Revised",
      timestamp: new Date().toISOString(),
    });

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

    const result = await offerRepository.findMany(companyId, parsedQuery, skip, take);
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

    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const offer = await ensureOfferExists(id, false, tx);
      ensureOfferNotDeleted(offer);
      validateCompanyAccess(offer.companyId, currentUser);

      // Accepted offers are immutable and cannot be deleted
      if (offer.status === OfferStatus.ACCEPTED) {
        throw new ConflictError("Accepted offers are immutable and cannot be deleted");
      }

      return await offerRepository.softDelete(id, tx);
    }, {
      timeout: 20000,
    });
  },
};
