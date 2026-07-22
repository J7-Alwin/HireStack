import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import multer from "multer";
import { ApiError } from "../shared/errors/ApiError";
import { errorResponse } from "../shared/responses/error.response";
import { logger } from "../shared/logger/logger";
import { HTTP_STATUS } from "../shared/constants/api.constants";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = "An unexpected error occurred";
  let errors: unknown[] = [];

  const isProduction = process.env.NODE_ENV === "production";
  const stack = err instanceof Error ? err.stack : undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = Array.isArray(err.details) ? err.details : err.details ? [err.details] : [];
  } else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = "Validation failed";
    errors = err.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
  } else if (err instanceof jwt.TokenExpiredError) {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Token has expired";
  } else if (err instanceof jwt.JsonWebTokenError) {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = "Invalid token signature";
  } else if (err instanceof multer.MulterError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = `File upload error: ${err.message}`;
    errors = [{ code: err.code, field: err.field }];
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    if (err.code === "P2002") {
      statusCode = HTTP_STATUS.CONFLICT;
      message = "Unique constraint violation on record";
      errors = [{ target: err.meta?.target }];
    } else if (err.code === "P2025") {
      statusCode = HTTP_STATUS.NOT_FOUND;
      message = "Record not found";
    } else {
      message = isProduction ? "Database operation failed" : err.message;
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log server-side issues (>= 500)
  if (statusCode >= 500) {
    logger.error(`[ErrorMiddleware] ${req.method} ${req.url} - ${message}`, err, {
      requestId: req.requestId,
      statusCode,
    });
  } else {
    logger.debug(`[ErrorMiddleware] Client Error: ${message}`, {
      method: req.method,
      url: req.url,
      statusCode,
      errors,
    });
  }

  res.status(statusCode).json(errorResponse(message, errors, stack));
}
