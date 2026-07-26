import { Role } from "../enums/role.enum";
import { Permission } from "./permissions";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission),

  [Role.COMPANY_ADMIN]: [
    Permission.CREATE_JOB,
    Permission.EDIT_JOB,
    Permission.DELETE_JOB,
    Permission.VIEW_JOB,
    Permission.VIEW_APPLICATION,
    Permission.MANAGE_APPLICATION_STATUS,
    Permission.EDIT_COMPANY,
    Permission.VIEW_COMPANY,
    Permission.VIEW_RESUME,
    Permission.MANAGE_RECRUITERS,
    Permission.MANAGE_USERS,
  ],

  [Role.RECRUITER]: [
    Permission.CREATE_JOB,
    Permission.EDIT_JOB,
    Permission.DELETE_JOB,
    Permission.VIEW_JOB,
    Permission.VIEW_APPLICATION,
    Permission.MANAGE_APPLICATION_STATUS,
    Permission.EDIT_COMPANY,
    Permission.VIEW_COMPANY,
    Permission.VIEW_RESUME,
  ],

  [Role.CANDIDATE]: [
    Permission.VIEW_JOB,
    Permission.APPLY_JOB,
    Permission.VIEW_APPLICATION, // viewing own application
    Permission.WITHDRAW_APPLICATION,
    Permission.CREATE_RESUME,
    Permission.EDIT_RESUME,
    Permission.DELETE_RESUME,
    Permission.VIEW_RESUME, // viewing own resume
    Permission.VIEW_COMPANY,
  ],
};
