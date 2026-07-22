import { Role } from "../enums/role.enum";
import { AccountStatus } from "../enums/status.enum";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
  errors?: unknown[];
  stack?: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  companyId?: string | null;
  recruiterId?: string | null;
}

export type RequestUser = AuthenticatedUser;

// Extend express Request using declare module instead of namespace
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthenticatedUser;
    requestId?: string;
    startTime?: number;
  }
}
