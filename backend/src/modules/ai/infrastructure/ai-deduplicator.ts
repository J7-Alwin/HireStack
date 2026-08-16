import { logger } from "../../../shared/logger/logger";

/**
 * Manages concurrent in-flight AI requests to prevent duplicate LLM calls
 * for identical evaluation payloads.
 */
export class AiRequestDeduplicator {
    private inFlightRequests = new Map<string, Promise<unknown>>();

    /**
     * Executes the factory function or joins an existing in-flight promise for the same key.
     */
    async executeOrDeduplicate<T>(
        key: string,
        factory: () => Promise<T>
    ): Promise<{ result: T; deduplicated: boolean }> {
        const existingPromise = this.inFlightRequests.get(key);
        if (existingPromise) {
            logger.info("AI Request Deduplication: Joining existing in-flight evaluation");
            const result = (await existingPromise) as T;
            return { result, deduplicated: true };
        }

        const executionPromise = factory();
        this.inFlightRequests.set(key, executionPromise);

        try {
            const result = await executionPromise;
            return { result, deduplicated: false };
        } finally {
            // Always release in-flight lock upon resolution or rejection
            this.inFlightRequests.delete(key);
        }
    }

    /**
     * Returns count of current in-flight executions.
     */
    getInFlightCount(): number {
        return this.inFlightRequests.size;
    }

    /**
     * Clears all in-flight trackers (for testing/resets).
     */
    clear(): void {
        this.inFlightRequests.clear();
    }
}

export const aiRequestDeduplicator = new AiRequestDeduplicator();
