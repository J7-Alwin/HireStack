import { OfferStatus } from "@prisma/client";
import { STATUS_TRANSITION_RULES } from "../constants/offer.constants";
import { UnprocessableEntityError } from "../../../shared/errors";

export const OfferStateMachine = {
  canTransition(currentStatus: OfferStatus, nextStatus: OfferStatus): boolean {
    const allowed = STATUS_TRANSITION_RULES[currentStatus] || [];
    return allowed.includes(nextStatus);
  },

  throwIfInvalidTransition(currentStatus: OfferStatus, nextStatus: OfferStatus): void {
    if (!this.canTransition(currentStatus, nextStatus)) {
      throw new UnprocessableEntityError(
        `Invalid offer status transition from ${currentStatus} to ${nextStatus}`
      );
    }
  },

  supportedTransitions(currentStatus: OfferStatus): OfferStatus[] {
    return STATUS_TRANSITION_RULES[currentStatus] || [];
  },
};
