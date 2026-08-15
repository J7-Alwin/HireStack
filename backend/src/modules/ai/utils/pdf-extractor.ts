import { PDFParse } from "pdf-parse";

export class PdfExtractor {
    /**
     * Extract plain text from a PDF buffer.
     */
    static async extract(buffer: Buffer): Promise<string> {
        try {
            const parser = new PDFParse({ data: buffer });

            const result = await parser.getText();

            await parser.destroy();

            const text = result.text
                .replace(/\r/g, "")
                .replace(/\n{2,}/g, "\n")
                .trim();

            if (!text) {
                throw new Error("No readable text found in the uploaded PDF.");
            }

            return text;
        } catch (error) {
            throw new Error(
                `Failed to extract PDF content: ${error instanceof Error ? error.message : "Unknown error"}`,
                { cause: error }
            );
        }
    }
}