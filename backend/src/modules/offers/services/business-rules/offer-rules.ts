import { Role, OfferStatus, Prisma, ApplicationStatus } from "@prisma/client";
import {
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from "../../../../shared/errors";
import { AuthenticatedUser } from "../../../../shared/types";
import { OFFER_MESSAGES } from "../../constants/offer.constants";
import { offerRepository } from "../../repositories/offer.repository";
import { OfferDto } from "../../types/offer.dto";

// Company and user access scopes
export function validateCompanyAccess(
  entityCompanyId: string,
  currentUser: AuthenticatedUser
): void {
  if (currentUser.role === Role.SUPER_ADMIN) {
    throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
  }
  if (entityCompanyId !== currentUser.companyId) {
    throw new ForbiddenError(OFFER_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

export function enforceWriterRole(currentUser: AuthenticatedUser): void {
  if (currentUser.role !== Role.COMPANY_ADMIN && currentUser.role !== Role.RECRUITER) {
    throw new ForbiddenError(OFFER_MESSAGES.FORBIDDEN_ACCESS);
  }
}

// Business rule helpers
export async function ensureOfferExists(
  id: string,
  includeDeleted = false,
  tx?: Prisma.TransactionClient
): Promise<OfferDto> {
  const offer = await offerRepository.findOfferById(id, includeDeleted, tx);
  if (!offer) {
    throw new NotFoundError(OFFER_MESSAGES.OFFER_NOT_FOUND);
  }
  return offer;
}

export function ensureOfferNotDeleted(offer: OfferDto): void {
  if (offer.deletedAt) {
    throw new NotFoundError(OFFER_MESSAGES.OFFER_NOT_FOUND);
  }
}

export function ensureOfferBelongsToCompany(offer: OfferDto, companyId: string): void {
  if (offer.companyId !== companyId) {
    throw new ForbiddenError(OFFER_MESSAGES.CROSS_COMPANY_ACCESS_FORBIDDEN);
  }
}

export function validateOfferAccess(offer: OfferDto, currentUser: AuthenticatedUser): void {
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

export async function getOfferAndValidateAccess(
  id: string,
  currentUser: AuthenticatedUser,
  tx?: Prisma.TransactionClient
): Promise<OfferDto> {
  const offer = await ensureOfferExists(id, false, tx);
  validateOfferAccess(offer, currentUser);
  return offer;
}

export function ensureOfferEditable(offer: OfferDto): void {
  if (offer.status !== OfferStatus.DRAFT) {
    throw new ConflictError(OFFER_MESSAGES.ONLY_DRAFT_EDITABLE);
  }
}

export function ensureApplicationEligible(
  application: { companyId: string; status: string } | null,
  companyId: string
): void {
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

export function verifyNoImmutableFields(body: unknown): void {
  const immutableFields = [
    "offerCode",
    "companyId",
    "applicationId",
    "candidateId",
    "version",
    "createdAt",
  ];
  for (const field of immutableFields) {
    if (body && typeof body === "object" && field in body) {
      throw new ValidationError(OFFER_MESSAGES.IMMUTABLE_FIELD_UPDATE);
    }
  }
}

export function validateDateBounds(joiningDateStr: string, expiryDateStr: string): void {
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
