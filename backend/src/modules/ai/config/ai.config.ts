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