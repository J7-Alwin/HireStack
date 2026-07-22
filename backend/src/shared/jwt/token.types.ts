import { Role } from "../enums/role.enum";
import { AccountStatus } from "../enums/status.enum";

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  status: AccountStatus;
  companyId?: string | null;
  recruiterId?: string | null;
}
