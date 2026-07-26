import { z } from "zod";
import { requiredNormalizedString } from "./shared";

export const cancelSchema = z.object({
  cancellationReason: requiredNormalizedString(
    1000,
    "Cancellation reason is required",
    "Cancellation reason cannot exceed allowed length"
  ),
});
