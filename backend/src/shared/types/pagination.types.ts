import { SortOrder } from "../enums/order.enum";

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
