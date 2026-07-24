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

export { SafeUser } from "../../shared/prisma/selects/user.select";
