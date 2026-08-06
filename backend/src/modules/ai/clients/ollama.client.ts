import { ChatOllama } from "@langchain/ollama";
import { AI_CONFIG } from "../config";

export const ollamaClient = new ChatOllama({
    baseUrl: AI_CONFIG.baseUrl,
    model: AI_CONFIG.model,
    temperature: AI_CONFIG.temperature,
    maxRetries: AI_CONFIG.maxRetries,
});