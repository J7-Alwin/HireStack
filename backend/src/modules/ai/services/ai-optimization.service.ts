import { z } from "zod";
import {
    AiFeatureType,
    AiOptimizationConfig,
} from "../types/optimization.types";
import {
    AI_CONFIG,
    AI_OPTIMIZATION_CONFIG,
} from "../config/ai.config";
import {
    aiCacheManager,
    aiRequestDeduplicator,
    aiExecutor,
} from "../infrastructure";
import { SafeCandidate } from "../../candidates/candidate.types";
import { SafeJob } from "../../jobs/job.types";
import { logger } from "../../../shared/logger/logger";

export interface OptimizeEvaluationParams<T> {
    candidate: SafeCandidate;
    job?: SafeJob | null;
    promptConfig: { template: string; version: string; name: string };
    userPrompt: string;
    schema: z.ZodSchema<T>;
    executeAi: () => Promise<T>;
    customConfig?: Partial<AiOptimizationConfig>;
}

export class AiOptimizationService {
    /**
     * Resolves AiFeatureType from prompt configuration or name.
     */
    resolveFeatureType(promptName: string): AiFeatureType {
        const name = promptName.toLowerCase();
        if (name.includes("ats")) {
            return AiFeatureType.ATS_SCORE;
        }
        if (name.includes("match")) {
            return AiFeatureType.JOB_MATCHING;
        }
        if (name.includes("recommendation")) {
            return AiFeatureType.RESUME_RECOMMENDATIONS;
        }
        if (name.includes("interview")) {
            return AiFeatureType.INTERVIEW_ASSISTANT;
        }
        if (name.includes("insight")) {
            return AiFeatureType.AI_INSIGHTS;
        }
        return AiFeatureType.ATS_SCORE;
    }

    /**
     * Optimizes AI evaluation with tenant-safe caching, in-flight deduplication,
     * timeout enforcement, and bounded exponential retry handling.
     */
    async optimizeEvaluation<T>(params: OptimizeEvaluationParams<T>): Promise<T> {
        const config: AiOptimizationConfig = {
            ...AI_OPTIMIZATION_CONFIG,
            ...params.customConfig,
        };

        const feature = this.resolveFeatureType(params.promptConfig.name);
        const inputHash = aiCacheManager.generateInputHash(params.userPrompt);

        // 1. Build deterministic, tenant-safe cache key
        const cacheKey = aiCacheManager.buildCacheKey({
            feature,
            companyId: params.candidate.companyId,
            candidateId: params.candidate.id,
            jobId: params.job?.id,
            promptVersion: params.promptConfig.version,
            model: AI_CONFIG.model,
            inputHash,
        });

        // 2. Safe Cache Lookup (Pre-execution optimization)
        if (config.enableCaching) {
            const cached = aiCacheManager.get<T>(cacheKey);
            if (cached) {
                logger.info("AI Cache Hit: Reusing valid cached evaluation", {
                    feature,
                    promptVersion: params.promptConfig.version,
                    model: AI_CONFIG.model,
                });
                return cached.data;
            }
        }

        // 3. Request Deduplication & Resilient Execution
        const executionFactory = async () => {
            const { result, metadata } = await aiExecutor.executeWithRetry<T>(
                async () => params.executeAi(),
                {
                    feature,
                    model: AI_CONFIG.model,
                    promptVersion: params.promptConfig.version,
                    timeoutMs: config.timeoutMs,
                    maxRetries: config.maxRetries,
                    retryBackoffMs: config.retryBackoffMs,
                    companyId: params.candidate.companyId,
                    candidateId: params.candidate.id,
                    jobId: params.job?.id,
                }
            );

            // 4. Store in Cache upon successful evaluation
            if (config.enableCaching) {
                aiCacheManager.set(cacheKey, result, config.cacheTtlSeconds, metadata);
            }

            return result;
        };

        if (config.enableDeduplication) {
            const { result } = await aiRequestDeduplicator.executeOrDeduplicate(
                cacheKey,
                executionFactory
            );
            return result;
        }

        return await executionFactory();
    }
}

export const aiOptimizationService = new AiOptimizationService();
