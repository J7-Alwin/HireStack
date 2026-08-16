/**
 * HireStack AI — AI Optimization Types (Phase 2 – Stage 8)
 *
 * Defines domain types, configuration contracts, execution metadata,
 * retry classification, and cache key specifications for the shared AI pipeline.
 */

export enum AiFeatureType {
    ATS_SCORE = "ATS_SCORE",
    JOB_MATCHING = "JOB_MATCHING",
    RESUME_RECOMMENDATIONS = "RESUME_RECOMMENDATIONS",
    INTERVIEW_ASSISTANT = "INTERVIEW_ASSISTANT",
    AI_INSIGHTS = "AI_INSIGHTS",
}

export enum AiExecutionStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
    RETRYING = "RETRYING",
}

export enum AiErrorCategory {
    TIMEOUT = "TIMEOUT",
    CONNECTION_FAILURE = "CONNECTION_FAILURE",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
    RATE_LIMIT = "RATE_LIMIT",
    INVALID_JSON = "INVALID_JSON",
    SCHEMA_VALIDATION_FAILURE = "SCHEMA_VALIDATION_FAILURE",
    AUTHORIZATION_FAILURE = "AUTHORIZATION_FAILURE",
    INPUT_VALIDATION_FAILURE = "INPUT_VALIDATION_FAILURE",
    UNKNOWN = "UNKNOWN",
}

/**
 * AI Optimization and Resilience Configuration
 */
export interface AiOptimizationConfig {
    timeoutMs: number;
    maxRetries: number;
    retryBackoffMs: number;
    cacheTtlSeconds: number;
    enableCaching: boolean;
    enableDeduplication: boolean;
}

/**
 * Execution metadata tracked during an AI evaluation run
 */
export interface AiExecutionMetadata {
    feature: AiFeatureType;
    model: string;
    promptVersion: string;
    durationMs: number;
    retryCount: number;
    cacheHit: boolean;
    status: AiExecutionStatus;
    errorCategory?: AiErrorCategory;
    companyId?: string;
    candidateId?: string;
    jobId?: string;
}

/**
 * Deterministic cache key structure
 */
export interface AiCacheKeyComponents {
    feature: AiFeatureType;
    companyId: string;
    candidateId?: string;
    jobId?: string;
    promptVersion: string;
    model: string;
    temperature: number;
    inputHash: string;
}

/**
 * Cache entry payload
 */
export interface AiCacheEntry<T = unknown> {
    key: string;
    data: T;
    createdAt: number;
    expiresAt: number;
    metadata: AiExecutionMetadata;
}

/**
 * Retry classification decision
 */
export interface RetryDecision {
    shouldRetry: boolean;
    category: AiErrorCategory;
    backoffMs: number;
    attempt: number;
    maxRetries: number;
    reason: string;
}
