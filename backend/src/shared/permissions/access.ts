import { Role } from "../enums/role.enum";
import { Permission } from "./permissions";
import { ROLE_PERMISSIONS } from "./roles";

export const permissionHelper = {
  hasRole: (userRole: Role, allowedRoles: Role[]): boolean => {
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }
    return allowedRoles.includes(userRole);
  },

  hasPermission: (userRole: Role, requiredPermission: Permission): boolean => {
    const permissions = ROLE_PERMISSIONS[userRole] || [];
    return permissions.includes(requiredPermission);
  },

  isOwner: (userId: string, resourceOwnerId: string): boolean => {
    return userId === resourceOwnerId;
  },

  canManageJob: (
    userId: string,
    jobOwnerId: string,
    userCompanyId: string | null | undefined,
    jobCompanyId: string,
    userRole: Role
  ): boolean => {
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }
    if (userRole !== Role.RECRUITER) {
      return false;
    }
    // Recruiters can edit if they belong to the same company
    return !!userCompanyId && userCompanyId === jobCompanyId;
  },

  canManageCompany: (
    userCompanyId: string | null | undefined,
    companyId: string,
    userRole: Role
  ): boolean => {
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }
    if (userRole !== Role.RECRUITER) {
      return false;
    }
    return !!userCompanyId && userCompanyId === companyId;
  },

  canViewApplication: (
    userId: string,
    applicantId: string,
    userCompanyId: string | null | undefined,
    jobCompanyId: string,
    userRole: Role
  ): boolean => {
    if (userRole === Role.SUPER_ADMIN) {
      return true;
    }
    if (userRole === Role.CANDIDATE) {
      return userId === applicantId;
    }
    if (userRole === Role.RECRUITER) {
      return !!userCompanyId && userCompanyId === jobCompanyId;
    }
    return false;
  },
};
