import { z } from "zod";
import {
    AiFeatureType,
    AiExecutionStatus,
    AiErrorCategory,
} from "../types/optimization.types";

/**
 * Zod Enum for AI Feature Types
 */
export const AiFeatureTypeSchema = z.nativeEnum(AiFeatureType);

/**
 * Zod Enum for Execution Statuses
 */
export const AiExecutionStatusSchema = z.nativeEnum(AiExecutionStatus);

/**
 * Zod Enum for Error Categories
 */
export const AiErrorCategorySchema = z.nativeEnum(AiErrorCategory);

/**
 * Validation schema for AI Optimization Configuration
 */
export const AiOptimizationConfigSchema = z.object({
    timeoutMs: z
        .number()
        .int("Timeout must be an integer")
        .min(1000, "Timeout must be at least 1000ms")
        .max(300000, "Timeout cannot exceed 300000ms (5 minutes)")
        .default(60000),
    maxRetries: z
        .number()
        .int("Max retries must be an integer")
        .min(0, "Max retries cannot be negative")
        .max(5, "Max retries cannot exceed 5")
        .default(2),
    retryBackoffMs: z
        .number()
        .int("Retry backoff must be an integer")
        .min(100, "Retry backoff must be at least 100ms")
        .max(10000, "Retry backoff cannot exceed 10000ms")
        .default(1000),
    cacheTtlSeconds: z
        .number()
        .int("Cache TTL must be an integer")
        .min(10, "Cache TTL must be at least 10 seconds")
        .max(86400, "Cache TTL cannot exceed 86400 seconds (24 hours)")
        .default(3600),
    enableCaching: z.boolean().default(false),
    enableDeduplication: z.boolean().default(true),
});

/**
 * Validation schema for AI Execution Metadata
 */
export const AiExecutionMetadataSchema = z.object({
    feature: AiFeatureTypeSchema,
    model: z.string().trim().min(1, "Model cannot be empty"),
    promptVersion: z.string().trim().min(1, "Prompt version cannot be empty"),
    durationMs: z.number().int().nonnegative("Duration cannot be negative"),
    retryCount: z.number().int().nonnegative("Retry count cannot be negative"),
    cacheHit: z.boolean(),
    status: AiExecutionStatusSchema,
    errorCategory: AiErrorCategorySchema.optional(),
    companyId: z.string().cuid("Invalid company ID").optional(),
    candidateId: z.string().cuid("Invalid candidate ID").optional(),
    jobId: z.string().cuid("Invalid job ID").optional(),
});

/**
 * Validation schema for Cache Key Components
 */
export const AiCacheKeyComponentsSchema = z.object({
    feature: AiFeatureTypeSchema,
    companyId: z.string().cuid("Invalid company ID format"),
    candidateId: z.string().cuid("Invalid candidate ID format").optional(),
    jobId: z.string().cuid("Invalid job ID format").optional(),
    promptVersion: z.string().trim().min(1, "Prompt version cannot be empty"),
    model: z.string().trim().min(1, "Model cannot be empty"),
    inputHash: z.string().trim().min(8, "Input hash must be at least 8 characters"),
});

/**
 * Validation schema for Retry Decision
 */
export const RetryDecisionSchema = z.object({
    shouldRetry: z.boolean(),
    category: AiErrorCategorySchema,
    backoffMs: z.number().int().nonnegative(),
    attempt: z.number().int().positive(),
    maxRetries: z.number().int().nonnegative(),
    reason: z.string().trim().min(1, "Reason cannot be empty"),
});
