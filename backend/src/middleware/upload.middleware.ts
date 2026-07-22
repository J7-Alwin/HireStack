import { Request, Response, NextFunction, RequestHandler } from "express";
import { uploadHelper } from "../shared/upload/upload.helper";
import { ValidationError } from "../shared/errors/ValidationError";

export interface UploadValidationOptions {
  maxSize: number;
  allowedMimes: string[];
  allowedExtensions: string[];
}

export function validateUpload(options: UploadValidationOptions): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Check single file from req.file
    if (req.file) {
      const result = uploadHelper.validateFile(
        {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
        },
        options
      );

      if (!result.valid) {
        return next(new ValidationError(result.error || "File validation failed"));
      }
    }

    // Check multiple files from req.files
    if (req.files) {
      const files: Express.Multer.File[] = Array.isArray(req.files)
        ? req.files
        : Object.values(req.files).flat();

      for (const file of files) {
        const result = uploadHelper.validateFile(
          {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
          },
          options
        );

        if (!result.valid) {
          return next(new ValidationError(result.error || "File validation failed"));
        }
      }
    }

    next();
  };
}
