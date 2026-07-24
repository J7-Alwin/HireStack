import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";

export interface UserQueryFilters {
  role?: Role;
  status?: AccountStatus;
  companyId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  showDeleted?: boolean;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: AccountStatus;
  isVerified: boolean;
  companyId: string | null;
  deletedAt: Date | null;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
