export { SafeUser } from "../../shared/prisma/selects/user.select";

export interface RecruiterQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  department?: string; // maps to departmentId
  designation?: string;
  isActive?: boolean;
  showDeleted?: boolean;
  companyId?: string; // Super Admin only
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RecruiterCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  designation: string;
  phone?: string;
  experience?: number;
  avatar?: string;
}

export interface RecruiterUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  designation?: string;
  experience?: number;
  avatar?: string;
  departmentId?: string;
}
