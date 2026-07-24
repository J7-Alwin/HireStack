export const DEPARTMENTS_MESSAGES = {
  DEPARTMENT_NOT_FOUND: "Department not found",
  DEPARTMENT_ALREADY_EXISTS: "Department name already exists in this company",
  DEPARTMENT_CREATED: "Department created successfully",
  DEPARTMENT_RETRIEVED: "Department retrieved successfully",
  DEPARTMENTS_RETRIEVED: "Departments retrieved successfully",
  DEPARTMENT_UPDATED: "Department updated successfully",
  STATUS_UPDATED: "Department status updated successfully",
  DEPARTMENT_DELETED: "Department soft-deleted successfully",
  DEPARTMENT_RESTORED: "Department restored successfully",
  COMPANY_NOT_FOUND: "Associated company does not exist",
  CROSS_COMPANY_ACCESS_FORBIDDEN: "Cross-company access to another company's department is not permitted",
  FORBIDDEN_MODIFICATION: "Only SUPER_ADMIN and COMPANY_ADMIN can modify departments",
  FORBIDDEN_ACCESS: "You do not have permission to perform this action",
  DELETE_PREVENTED_RECRUITERS: "Cannot delete department while active recruiters are assigned",
  DELETE_PREVENTED_JOBS: "Cannot delete department while active jobs are assigned",
  RESTORE_CONFLICT: "A department with this name already exists in the company",
};

export const PAGINATION_LIMITS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
