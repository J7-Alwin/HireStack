export class PromptBuilder {
    static build(systemPrompt: string, userPrompt: string): string {
        return `
${systemPrompt}

============================

${userPrompt}

============================

Return ONLY valid JSON.
`;
    }
}