import { AiOptimizationConfig } from "../types/optimization.types";
import { AiOptimizationConfigSchema } from "../schemas/optimization.schema";

export const AI_CONFIG = {
    provider: "ollama",

    baseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",

    model: process.env.OLLAMA_MODEL || "llama3.2",

    embeddingModel:
        process.env.OLLAMA_EMBEDDING_MODEL || "nomic-embed-text",

    temperature: Number(process.env.AI_TEMPERATURE ?? 0.2),

    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 2),

    timeout: Number(process.env.AI_TIMEOUT ?? 60000),
} as const;

/**
 * Validated AI Optimization and Pipeline Resilience Configuration
 */
const rawOptimizationConfig = {
    timeoutMs: Number(process.env.AI_TIMEOUT ?? 60000),
    maxRetries: Number(process.env.AI_MAX_RETRIES ?? 2),
    retryBackoffMs: Number(process.env.AI_RETRY_BACKOFF_MS ?? 1000),
    cacheTtlSeconds: Number(process.env.AI_CACHE_TTL_SECONDS ?? 3600),
    enableCaching: process.env.AI_ENABLE_CACHING === "true",
    enableDeduplication: process.env.AI_ENABLE_DEDUPLICATION !== "false",
};

export const AI_OPTIMIZATION_CONFIG: AiOptimizationConfig =
    AiOptimizationConfigSchema.parse(rawOptimizationConfig);