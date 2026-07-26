import { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { errorResponse } from "../shared/responses/error.response";
import { HTTP_STATUS } from "../shared/constants/api.constants";

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export function createRateLimiter(options?: RateLimitOptions): RequestHandler {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 15 minutes default
    max: options?.max || 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, _next) => {
      res
        .status(HTTP_STATUS.TOO_MANY_REQUESTS)
        .json(
          errorResponse(
            options?.message || "Too many requests from this IP, please try again later"
          )
        );
    },
  }) as unknown as RequestHandler;
}

// Preset Limiters
export const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: "Too many requests, please try again later",
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: "Too many authentication requests, please try again later",
});

export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: "Too many upload requests, please try again later",
});
