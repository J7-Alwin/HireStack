import * as crypto from "crypto";
import {
    AiCacheKeyComponents,
    AiCacheEntry,
    AiExecutionMetadata,
} from "../types/optimization.types";
import { AiCacheKeyComponentsSchema } from "../schemas/optimization.schema";
import { logger } from "../../../shared/logger/logger";

/**
 * Tenant-safe, in-memory AI Response Cache Manager
 */
export class AiCacheManager {
    private store = new Map<string, AiCacheEntry<unknown>>();
    private readonly maxEntries = 1000;

    /**
     * Constructs a deterministic, tenant-isolated cache key.
     */
    buildCacheKey(components: AiCacheKeyComponents): string {
        const validated = AiCacheKeyComponentsSchema.parse(components);
        const candPart = validated.candidateId || "none";
        const jobPart = validated.jobId || "none";
        return `ai:${validated.feature}:${validated.companyId}:${candPart}:${jobPart}:${validated.promptVersion}:${validated.model}:${validated.inputHash}`;
    }

    /**
     * Generates a deterministic SHA-256 hash slice from input text.
     */
    generateInputHash(input: string): string {
        return crypto
            .createHash("sha256")
            .update(input.trim())
            .digest("hex")
            .slice(0, 16);
    }

    /**
     * Retrieves an entry if present and not expired.
     */
    get<T>(key: string): AiCacheEntry<T> | null {
        try {
            const entry = this.store.get(key);
            if (!entry) {
                return null;
            }

            if (Date.now() > entry.expiresAt) {
                this.store.delete(key);
                return null;
            }

            return entry as AiCacheEntry<T>;
        } catch (error) {
            logger.warn("AI Cache get operation failed, falling back to cache miss", { error });
            return null;
        }
    }

    /**
     * Stores an evaluation result with a configured TTL.
     */
    set<T>(key: string, data: T, ttlSeconds: number, metadata: AiExecutionMetadata): void {
        try {
            // Evict oldest entries if capacity reached
            if (this.store.size >= this.maxEntries) {
                const oldestKey = this.store.keys().next().value;
                if (oldestKey) {
                    this.store.delete(oldestKey);
                }
            }

            const now = Date.now();
            const expiresAt = now + ttlSeconds * 1000;

            const entry: AiCacheEntry<T> = {
                key,
                data,
                createdAt: now,
                expiresAt,
                metadata: {
                    ...metadata,
                    cacheHit: true,
                },
            };

            this.store.set(key, entry as AiCacheEntry<unknown>);
        } catch (error) {
            logger.warn("AI Cache set operation failed gracefully", { error });
        }
    }

    /**
     * Removes an entry by key.
     */
    delete(key: string): boolean {
        return this.store.delete(key);
    }

    /**
     * Clears all cached entries.
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Returns total active entry count.
     */
    size(): number {
        return this.store.size;
    }
}

export const aiCacheManager = new AiCacheManager();
