type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = ["password", "token", "secret", "cookie", "jwt", "authorization", "cvv", "hash"];

function maskSensitiveInfo(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // Check if the string itself might look like a token or JWT or auth header
    // Or if it contains sensitive patterns. If it's a JSON string, we can try parsing it.
    try {
      const parsed = JSON.parse(data) as unknown;
      return JSON.stringify(maskSensitiveInfo(parsed));
    } catch {
      // Just check if it resembles Bearer token or raw token
      if (data.toLowerCase().startsWith("bearer ")) {
        return "Bearer [MASKED]";
      }
      return data;
    }
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveInfo(item));
  }

  if (typeof data === "object") {
    const masked: Record<string, unknown> = {};
    const obj = data as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive))) {
        masked[key] = "[MASKED]";
      } else {
        masked[key] = maskSensitiveInfo(obj[key]);
      }
    }
    return masked;
  }

  return data;
}

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, meta?: unknown): string {
    const timestamp = this.getTimestamp();
    const cleanMeta = meta ? maskSensitiveInfo(meta) : "";
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...(cleanMeta && typeof cleanMeta === "object" ? (cleanMeta as object) : { meta: cleanMeta }),
      });
    }

    // Color/formatting for development
    const colors = {
      info: "\x1b[32m", // Green
      warn: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
      debug: "\x1b[36m", // Cyan
      reset: "\x1b[0m",
    };

    const color = colors[level] || colors.reset;
    const metaString = cleanMeta ? ` | Meta: ${JSON.stringify(cleanMeta, null, 2)}` : "";
    return `[${timestamp}] ${color}${level.toUpperCase()}${colors.reset}: ${message}${metaString}`;
  }

  public info(message: string, meta?: unknown): void {
    console.log(this.formatMessage("info", message, meta));
  }

  public warn(message: string, meta?: unknown): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  public error(message: string, error?: unknown, meta?: unknown): void {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error;
    
    console.error(this.formatMessage("error", message, { error: errorDetails, ...(meta as object || {}) }));
  }

  public debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.log(this.formatMessage("debug", message, meta));
    }
  }
}

export const logger = new Logger();
