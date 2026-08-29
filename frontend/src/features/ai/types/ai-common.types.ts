export interface AiHealthCheckResponse {
  readonly status: 'healthy' | 'unhealthy' | string
  readonly model: string
  readonly timestamp?: string
}

export type HiringRecommendationType =
  | 'STRONGLY_RECOMMENDED'
  | 'RECOMMENDED'
  | 'CONSIDER'
  | 'NOT_RECOMMENDED'

export interface AiMetadata {
  readonly aiModel: string
  readonly promptVersion: string
  readonly createdAt: string
  readonly updatedAt?: string
}

export type AiErrorCategory =
  | 'TIMEOUT'
  | 'CONNECTION_FAILURE'
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMIT'
  | 'INVALID_JSON'
  | 'SCHEMA_VALIDATION_FAILURE'
  | 'AUTHORIZATION_FAILURE'
  | 'INPUT_VALIDATION_FAILURE'
  | 'UNKNOWN'
