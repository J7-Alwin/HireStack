export const USERS_MESSAGES = {
  USER_NOT_FOUND: "User not found",
  USER_RETRIEVED: "User retrieved successfully",
  USERS_RETRIEVED: "Users retrieved successfully",
  STATUS_UPDATED: "User status updated successfully",
  USER_DELETED: "User deleted successfully",
  USER_RESTORED: "User restored successfully",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  FORBIDDEN_RESTORE: "Only SUPER_ADMIN can restore soft-deleted users",
  FORBIDDEN_DELETE: "Only SUPER_ADMIN can delete users",
  FORBIDDEN_ACCESS: "You do not have permission to access this resource",
  COMPANY_ISOLATION_VIOLATION: "Cross-company access is not permitted",
};

export const PAGINATION_LIMITS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
