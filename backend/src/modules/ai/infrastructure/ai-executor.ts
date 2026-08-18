import {
    AiExecutionMetadata,
    AiExecutionStatus,
    AiFeatureType,
} from "../types/optimization.types";
import {
    classifyAiError,
    getRetryDecision,
} from "./error-classifier";
import { logger } from "../../../shared/logger/logger";

export interface AiExecutionOptions {
    feature: AiFeatureType;
    model: string;
    promptVersion: string;
    timeoutMs: number;
    maxRetries: number;
    retryBackoffMs: number;
    companyId?: string;
    candidateId?: string;
    jobId?: string;
}

export class AiExecutor {
    /**
     * Executes a promise with an enforced timeout, guaranteeing timer cleanup.
     */
    async executeWithTimeout<T>(
        fn: () => Promise<T>,
        timeoutMs: number,
        timeoutMessage = `AI execution timed out after ${timeoutMs}ms`
    ): Promise<T> {
        let timeoutHandle: NodeJS.Timeout | undefined;

        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutHandle = setTimeout(() => {
                const timeoutError = new Error(timeoutMessage);
                timeoutError.name = "TimeoutError";
                reject(timeoutError);
            }, timeoutMs);
        });

        try {
            return await Promise.race([fn(), timeoutPromise]);
        } finally {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
            }
        }
    }

    /**
     * Executes an AI operation with timeout, error classification, and bounded exponential backoff retries.
     */
    async executeWithRetry<T>(
        operation: (attempt: number) => Promise<T>,
        options: AiExecutionOptions
    ): Promise<{ result: T; metadata: AiExecutionMetadata }> {
        const startTime = Date.now();
        let attempt = 0;
        let lastError: unknown;

        while (attempt <= options.maxRetries) {
            attempt++;
            try {
                logger.info(
                    `AI Execution Attempt ${attempt}/${options.maxRetries + 1} for feature ${options.feature}`
                );

                const result = await this.executeWithTimeout(
                    () => operation(attempt),
                    options.timeoutMs
                );

                const durationMs = Date.now() - startTime;
                const metadata: AiExecutionMetadata = {
                    feature: options.feature,
                    model: options.model,
                    promptVersion: options.promptVersion,
                    durationMs,
                    retryCount: attempt - 1,
                    cacheHit: false,
                    status: AiExecutionStatus.SUCCESS,
                    companyId: options.companyId,
                    candidateId: options.candidateId,
                    jobId: options.jobId,
                };

                logger.info("AI Execution Succeeded", {
                    feature: metadata.feature,
                    durationMs: metadata.durationMs,
                    retryCount: metadata.retryCount,
                    model: metadata.model,
                });

                return { result, metadata };
            } catch (error) {
                lastError = error;
                const decision = getRetryDecision(
                    error,
                    attempt,
                    options.maxRetries + 1,
                    options.retryBackoffMs
                );

                if (decision.shouldRetry) {
                    logger.warn(
                        `AI Execution transient failure (${decision.category}), backing off for ${decision.backoffMs}ms before attempt ${attempt + 1}`
                    );
                    if (decision.backoffMs > 0) {
                        await new Promise((resolve) => setTimeout(resolve, decision.backoffMs));
                    }
                } else {
                    const durationMs = Date.now() - startTime;
                    const errorCategory = classifyAiError(error);
                    const metadata: AiExecutionMetadata = {
                        feature: options.feature,
                        model: options.model,
                        promptVersion: options.promptVersion,
                        durationMs,
                        retryCount: attempt - 1,
                        cacheHit: false,
                        status: AiExecutionStatus.FAILED,
                        errorCategory,
                        companyId: options.companyId,
                        candidateId: options.candidateId,
                        jobId: options.jobId,
                    };

                    logger.error("AI Execution Terminated with Failure", {
                        feature: metadata.feature,
                        errorCategory: metadata.errorCategory,
                        durationMs: metadata.durationMs,
                        retryCount: metadata.retryCount,
                    });

                    throw error;
                }
            }
        }

        throw lastError;
    }
}

export const aiExecutor = new AiExecutor();
