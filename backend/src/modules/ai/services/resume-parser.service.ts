import { PdfExtractor } from "../utils/pdf-extractor";
import { PromptBuilder } from "../utils/prompt-builder";
import { JsonParser } from "../utils/json-parser";
import { RESUME_PARSER_PROMPT } from "../prompts/resume.prompt";
import { aiService } from "./ai.service";
import { ResumeData } from "../types/resume.types";
import { ResumeSchema } from "../schemas/resume.schema";

export class ResumeParserService {
    async parseResume(buffer: Buffer): Promise<ResumeData> {
        // Step 1
        const resumeText = await PdfExtractor.extract(buffer);

        // Step 2
        const prompt = PromptBuilder.build(
            RESUME_PARSER_PROMPT,
            resumeText
        );

        // Step 3
        const response = await aiService.generate(prompt);

        const parsed = JsonParser.parse<ResumeData>(
            response.content
        );

        const validated = ResumeSchema.parse(parsed);

        return validated;
    }
}

export const resumeParserService = new ResumeParserService();