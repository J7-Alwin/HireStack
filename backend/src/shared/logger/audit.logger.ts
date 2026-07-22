import { logger } from "./logger";

export interface AuditLogData {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: string;
  category: string;
  resourceId?: string;
  resourceType?: string;
  description: string;
  severity: "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export const auditLogger = {
  log: (data: AuditLogData) => {
    logger.info(`Audit Log [${data.category}] - ${data.action} by User ${data.userId}`, {
      audit: true,
      ...data,
    });
  },
};
