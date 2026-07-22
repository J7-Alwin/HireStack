import { ApiResponse } from "../types/api.types";

export function successResponse<T>(
  message: string,
  data?: T,
  meta?: Record<string, any>
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}
