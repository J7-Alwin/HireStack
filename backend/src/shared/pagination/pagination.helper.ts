import { PAGINATION_DEFAULTS } from "../constants/pagination.constants";
import { PaginationMeta, PaginationParams } from "./pagination.types";

export interface PrismaPaginationOptions {
  skip: number;
  take: number;
}

export const paginationHelper = {
  getPrismaOptions: (params: PaginationParams): PrismaPaginationOptions => {
    const page = Math.max(1, Number(params.page) || PAGINATION_DEFAULTS.PAGE);
    const limit = Math.min(
      PAGINATION_DEFAULTS.MAX_LIMIT,
      Math.max(1, Number(params.limit) || PAGINATION_DEFAULTS.LIMIT)
    );

    const skip = (page - 1) * limit;
    const take = limit;

    return { skip, take };
  },

  createMeta: (total: number, params: PaginationParams): PaginationMeta => {
    const page = Math.max(1, Number(params.page) || PAGINATION_DEFAULTS.PAGE);
    const limit = Math.min(
      PAGINATION_DEFAULTS.MAX_LIMIT,
      Math.max(1, Number(params.limit) || PAGINATION_DEFAULTS.LIMIT)
    );

    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
    };
  },
};
