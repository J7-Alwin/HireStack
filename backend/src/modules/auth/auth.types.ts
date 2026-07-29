import { Role } from "../../shared/enums/role.enum";
import { AccountStatus } from "../../shared/enums/status.enum";

export interface LoginResponseData {
  user: {
    id: string;
    email: string;
    role: Role;
    status: AccountStatus;
    companyId: string | null;
  };
  accessToken: string;
  refreshToken: string;
  mustChangePassword: boolean;
}
