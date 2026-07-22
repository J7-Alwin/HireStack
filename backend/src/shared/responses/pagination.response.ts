import { ApiResponse } from "../types/api.types";
import { PaginationMeta } from "../types/pagination.types";

export function paginationResponse<T>(
  message: string,
  data: T[],
  meta: PaginationMeta
): ApiResponse<T[]> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}
