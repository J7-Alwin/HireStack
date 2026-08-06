export class JsonParser {
    /**
     * Parse an LLM response into JSON.
     */
    static parse<T>(content: string): T {
        let text = content.trim();

        // Remove markdown fences
        text = text
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        // Try direct parsing
        try {
            return JSON.parse(text) as T;
        } catch {
            // continue
        }

        // Extract first JSON object
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");

        if (start === -1 || end === -1 || end <= start) {
            throw new Error("AI did not return a valid JSON object.");
        }

        const json = text.substring(start, end + 1);

        try {
            return JSON.parse(json) as T;
        } catch {
            throw new Error("Unable to parse AI response.");
        }
    }
}