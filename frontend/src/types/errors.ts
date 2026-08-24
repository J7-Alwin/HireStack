export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_FAILED'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR'
  | 'MAINTENANCE_MODE'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'ABORTED'
  | 'UNKNOWN'

export interface ApiErrorDetail {
  readonly field?: string
  readonly message: string
  readonly code?: string
  readonly target?: unknown
}
