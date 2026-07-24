export { SafeDepartment } from "../../shared/prisma/selects/department.select";

export interface DepartmentQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showDeleted?: boolean;
  companyId?: string; // Super Admin only filter
}

export interface DepartmentCreateInput {
  name: string;
  description?: string;
}

export interface DepartmentUpdateInput {
  name?: string;
  description?: string;
}
