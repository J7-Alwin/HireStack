import { logger } from "./logger";

export interface RequestLogData {
  method: string;
  url: string;
  statusCode?: number;
  responseTimeMs?: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

export const requestLogger = {
  logRequest: (data: RequestLogData) => {
    const { method, url, ip, userAgent, userId } = data;
    logger.info(`Incoming Request: ${method} ${url}`, {
      method,
      url,
      ip,
      userAgent,
      userId,
    });
  },

  logResponse: (data: RequestLogData) => {
    const { method, url, statusCode, responseTimeMs, userId } = data;
    logger.info(`Request Completed: ${method} ${url} - ${statusCode} in ${responseTimeMs}ms`, {
      method,
      url,
      statusCode,
      responseTimeMs,
      userId,
    });
  },
};
