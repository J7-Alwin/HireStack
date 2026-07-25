export const APPLICATIONS_MESSAGES = {
  APPLICATION_NOT_FOUND: "Application not found",
  APPLICATION_CREATED: "Application created successfully",
  APPLICATION_RETRIEVED: "Application retrieved successfully",
  APPLICATIONS_RETRIEVED: "Applications retrieved successfully",
  APPLICATION_UPDATED: "Application updated successfully",
  APPLICATION_STAGE_UPDATED: "Application stage updated successfully",
  APPLICATION_STATUS_UPDATED: "Application status updated successfully",
  RECRUITER_ASSIGNED: "Recruiter assigned successfully",
  APPLICATION_REJECTED: "Application rejected successfully",
  APPLICATION_WITHDRAWN: "Application withdrawal recorded successfully",
  APPLICATION_DELETED: "Application soft-deleted successfully",
  APPLICATION_RESTORED: "Application restored successfully",
  DUPLICATE_APPLICATION: "Candidate already has an active Application for this Job",
  FORBIDDEN_MODIFICATION: "You do not have permission to manage this application",
  FORBIDDEN_ACCESS: "You do not have permission to perform this action",
  CROSS_COMPANY_ACCESS_FORBIDDEN: "Cross-company access is not permitted",
  CANDIDATE_NOT_FOUND: "Candidate not found",
  CANDIDATE_ARCHIVED: "Cannot create an application for an archived candidate",
  CANDIDATE_BLACKLISTED: "Cannot create an application for a blacklisted candidate",
  JOB_NOT_FOUND: "Job not found",
  JOB_NOT_OPEN: "Applications can only be created for open jobs",
  RECRUITER_NOT_FOUND: "Assigned recruiter not found",
  RECRUITER_ROLE_INVALID: "Assigned user must have the RECRUITER role",
  RECRUITER_COMPANY_MISMATCH: "Assigned recruiter must belong to the same company",
  INVALID_STAGE_TRANSITION: "Invalid stage transition",
  INVALID_STATUS_TRANSITION: "Invalid status transition",
  TERMINAL_STATE_READONLY: "Terminal states cannot transition back to ACTIVE",
  IMMUTABLE_FIELD_UPDATE: "Immutable fields cannot be modified",
  CANNOT_DELETE_DELETED: "Application is already soft-deleted",
  CANNOT_RESTORE_ACTIVE: "Application is already active",
};

export const PAGINATION_DEFAULTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Transition matrix for application stages
export const STAGE_TRANSITION_RULES: Record<string, string[]> = {
  APPLIED: ["SCREENING"],
  SCREENING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["OFFER", "REJECTED"],
  OFFER: ["HIRED", "REJECTED"],
};

// Transition matrix for application statuses
export const STATUS_TRANSITION_RULES: Record<string, string[]> = {
  ACTIVE: ["HIRED", "REJECTED", "WITHDRAWN", "ARCHIVED"],
  HIRED: [],      // Terminal
  REJECTED: [],   // Terminal
  WITHDRAWN: [],  // Terminal
  ARCHIVED: [],   // Terminal
};
