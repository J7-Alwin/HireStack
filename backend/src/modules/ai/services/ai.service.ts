import { ollamaClient } from "../clients";
import { AI_CONFIG } from "../config";

export class AiService {
    /**
     * Generate an AI response from a prompt.
     */
    async generate(prompt: string) {
        const startedAt = Date.now();

        const response = await ollamaClient.invoke(prompt);

        const responseTime = Date.now() - startedAt;

        return {
            content:
                typeof response.content === "string"
                    ? response.content
                    : JSON.stringify(response.content),

            responseTime,
        };
    }

    /**
     * Check whether the AI service is available.
     */
    async healthCheck() {
        const result = await this.generate(
            "Reply with ONLY the word HEALTHY."
        );

        return {
            provider: AI_CONFIG.provider,
            model: AI_CONFIG.model,
            status: result.content.trim().toUpperCase() === "HEALTHY"
                ? "healthy"
                : "unhealthy",
            responseTime: result.responseTime,
        };
    }
}

export const aiService = new AiService();