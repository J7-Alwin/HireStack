import { z } from "zod";
import {
    AiErrorCategory,
    RetryDecision,
} from "../types/optimization.types";
import { RetryDecisionSchema } from "../schemas/optimization.schema";
import {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
} from "../../../shared/errors";

/**
 * Classifies an arbitrary error into a standardized AiErrorCategory.
 */
export function classifyAiError(error: unknown): AiErrorCategory {
    if (!error) {
        return AiErrorCategory.UNKNOWN;
    }

    // Check Zod validation error
    if (error instanceof z.ZodError) {
        return AiErrorCategory.SCHEMA_VALIDATION_FAILURE;
    }

    // Check application authorization errors
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return AiErrorCategory.AUTHORIZATION_FAILURE;
    }

    // Check application input validation errors
    if (error instanceof ValidationError) {
        const msg = error.message.toLowerCase();
        if (msg.includes("json") || msg.includes("parse response")) {
            return AiErrorCategory.INVALID_JSON;
        }
        return AiErrorCategory.INPUT_VALIDATION_FAILURE;
    }

    if (error instanceof NotFoundError) {
        return AiErrorCategory.INPUT_VALIDATION_FAILURE;
    }

    if (error instanceof SyntaxError) {
        return AiErrorCategory.INVALID_JSON;
    }

    if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        const name = error.name.toLowerCase();

        if (name.includes("timeout") || msg.includes("timeout") || msg.includes("timed out")) {
            return AiErrorCategory.TIMEOUT;
        }

        if (
            msg.includes("econnrefused") ||
            msg.includes("enotfound") ||
            msg.includes("econnreset") ||
            msg.includes("fetch failed") ||
            msg.includes("connection refused") ||
            msg.includes("network error")
        ) {
            return AiErrorCategory.CONNECTION_FAILURE;
        }

        if (
            msg.includes("503") ||
            msg.includes("502") ||
            msg.includes("service unavailable") ||
            msg.includes("server overloaded")
        ) {
            return AiErrorCategory.SERVICE_UNAVAILABLE;
        }

        if (msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests")) {
            return AiErrorCategory.RATE_LIMIT;
        }

        if (msg.includes("json") || msg.includes("parse error")) {
            return AiErrorCategory.INVALID_JSON;
        }

        if (msg.includes("schema") || msg.includes("zod")) {
            return AiErrorCategory.SCHEMA_VALIDATION_FAILURE;
        }

        if (msg.includes("forbidden") || msg.includes("unauthorized") || msg.includes("permission")) {
            return AiErrorCategory.AUTHORIZATION_FAILURE;
        }
    }

    return AiErrorCategory.UNKNOWN;
}

/**
 * Determines whether a classified AiErrorCategory is transient and retryable.
 */
export function isAiErrorRetryable(category: AiErrorCategory): boolean {
    switch (category) {
        case AiErrorCategory.TIMEOUT:
        case AiErrorCategory.CONNECTION_FAILURE:
        case AiErrorCategory.SERVICE_UNAVAILABLE:
        case AiErrorCategory.RATE_LIMIT:
            return true;

        case AiErrorCategory.INVALID_JSON:
        case AiErrorCategory.SCHEMA_VALIDATION_FAILURE:
        case AiErrorCategory.AUTHORIZATION_FAILURE:
        case AiErrorCategory.INPUT_VALIDATION_FAILURE:
        case AiErrorCategory.UNKNOWN:
        default:
            return false;
    }
}

/**
 * Calculates deterministic retry decision and bounded exponential backoff interval.
 */
export function getRetryDecision(
    error: unknown,
    attempt: number,
    maxRetries: number,
    baseBackoffMs: number
): RetryDecision {
    const category = classifyAiError(error);
    const retryable = isAiErrorRetryable(category);
    const shouldRetry = retryable && attempt < maxRetries;

    const backoffMs = shouldRetry
        ? Math.min(baseBackoffMs * Math.pow(2, Math.max(0, attempt - 1)), 10000)
        : 0;

    const reason = !retryable
        ? `Error category ${category} is permanent and non-retryable`
        : attempt >= maxRetries
        ? `Maximum retry attempts (${maxRetries}) exhausted`
        : `Transient failure ${category}, retrying after ${backoffMs}ms backoff (attempt ${attempt + 1}/${maxRetries})`;

    const decision: RetryDecision = {
        shouldRetry,
        category,
        backoffMs,
        attempt,
        maxRetries,
        reason,
    };

    return RetryDecisionSchema.parse(decision);
}
