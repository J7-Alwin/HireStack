import { logger } from "./logger";

export interface RequestLogData {
  method: string;
  url: string;
  path?: string;
  requestId?: string;
  statusCode?: number;
  responseTimeMs?: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

export const requestLogger = {
  logRequest: (data: RequestLogData) => {
    const { method, url, path, requestId, ip, userAgent, userId } = data;
    logger.info(`Incoming Request: ${method} ${url}`, {
      method,
      url,
      path,
      requestId,
      ip,
      userAgent,
      userId,
    });
  },

  logResponse: (data: RequestLogData) => {
    const { method, url, path, requestId, statusCode, responseTimeMs, userId } = data;
    logger.info(`Request Completed: ${method} ${url} - ${statusCode} in ${responseTimeMs}ms`, {
      method,
      url,
      path,
      requestId,
      statusCode,
      responseTimeMs,
      userId,
    });
  },
};
