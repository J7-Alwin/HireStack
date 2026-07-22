import { z } from "zod";
import { ALLOWED_EXTENSIONS } from "../constants/upload.constants";

export const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
  destination: z.string().optional(),
  filename: z.string().optional(),
  path: z.string().optional(),
  buffer: z.any().optional(),
});

export function validateFileDetails(file: { originalname: string; mimetype: string; size: number }, maxSize: number, allowedMimes: string[]): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB` };
  }

  if (!allowedMimes.includes(file.mimetype)) {
    return { valid: false, error: "File format/MIME type is not allowed" };
  }

  const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
  const allAllowedExtensions = [...ALLOWED_EXTENSIONS.DOCUMENTS, ...ALLOWED_EXTENSIONS.IMAGES] as string[];
  if (!allAllowedExtensions.includes(ext)) {
    return { valid: false, error: "File extension is not allowed" };
  }

  return { valid: true };
}
