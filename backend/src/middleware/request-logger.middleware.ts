import { Request, Response, NextFunction, RequestHandler } from "express";
import { requestLogger } from "../shared/logger/request.logger";

export const requestLoggerMiddleware: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  const path = req.path || req.url || "";
  const requestId = req.requestId;
  const ip = req.ip || "";
  const userAgent = (req.headers["user-agent"] as string) || "";
  const userId = req.user?.id;

  // Log incoming request
  requestLogger.logRequest({
    method,
    url,
    path,
    requestId,
    ip,
    userAgent,
    userId,
  });

  // Log response when finish event fires
  res.on("finish", () => {
    const responseTimeMs = req.startTime ? Date.now() - req.startTime : 0;
    const statusCode = res.statusCode;

    requestLogger.logResponse({
      method,
      url,
      path,
      requestId,
      statusCode,
      responseTimeMs,
      userId,
    });
  });

  next();
};
