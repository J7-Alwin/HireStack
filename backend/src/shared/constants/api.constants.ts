export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_MESSAGES = {
  SUCCESS: "Operation successful",
  CREATED: "Resource created successfully",
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden access",
  NOT_FOUND: "Resource not found",
  CONFLICT: "Resource conflict",
  VALIDATION_FAILED: "Validation failed",
  INTERNAL_SERVER_ERROR: "An unexpected error occurred",
} as const;
