import { buildFilterConditions } from "./filters";
import { buildSortCondition } from "./sorting";
import { buildSearchCondition } from "./search";
import { paginationHelper } from "../pagination/pagination.helper";
import { PaginationParams } from "../pagination/pagination.types";

export interface BuildQueryParams {
  pagination?: PaginationParams;
  filters?: Record<string, unknown>;
  search?: string;
  searchFields?: string[];
}

export function buildPrismaQuery(params: BuildQueryParams) {
  const { pagination = {}, filters = {}, search, searchFields = [] } = params;

  const prismaPagination = paginationHelper.getPrismaOptions(pagination);
  const filterConditions = buildFilterConditions(filters);
  const searchConditions = buildSearchCondition(search, searchFields);
  const sortConditions = buildSortCondition(pagination.sortBy, pagination.sortOrder);

  const where: Record<string, unknown> = { ...filterConditions };

  if (searchConditions) {
    where.AND = [searchConditions];
  }

  return {
    where,
    orderBy: sortConditions,
    ...prismaPagination,
  };
}
