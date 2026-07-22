import { Role } from "../enums/role.enum";
import { AccountStatus } from "../enums/status.enum";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
  errors?: any[];
  stack?: string | null;
}

export interface RequestUser {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  companyId?: string | null;
  recruiterId?: string | null;
}

// Extend global express Request namespace (or declare it so it can be typed)
declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}
