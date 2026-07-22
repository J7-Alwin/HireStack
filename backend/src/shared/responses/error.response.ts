import { ApiResponse } from "../types/api.types";

export function errorResponse(
  message: string,
  errors?: unknown[],
  stack?: string | null
): ApiResponse {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    success: false,
    message,
    errors: errors || [],
    stack: isProduction ? null : stack || null,
  };
}
