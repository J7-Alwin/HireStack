/**
 * Centralized Query Key Factory
 *
 * Provides a standardized, type-safe query key pattern for all future feature modules.
 */

export interface EntityQueryKeys<TParams = Record<string, unknown>> {
  readonly all: readonly [string]
  readonly lists: () => readonly [string, 'list']
  readonly list: (params?: TParams) => readonly [string, 'list', TParams | undefined]
  readonly details: () => readonly [string, 'detail']
  readonly detail: (id: string | number) => readonly [string, 'detail', string | number]
  readonly custom: (...subKeys: readonly (string | number | Record<string, unknown>)[]) => readonly (string | number | Record<string, unknown>)[]
}

/**
 * Creates a standard query key factory for an entity.
 *
 * Example:
 * const candidateKeys = createEntityQueryKeys('candidates')
 * candidateKeys.all -> ['candidates']
 * candidateKeys.list({ page: 1 }) -> ['candidates', 'list', { page: 1 }]
 * candidateKeys.detail('123') -> ['candidates', 'detail', '123']
 */
export function createEntityQueryKeys<TParams = Record<string, unknown>>(
  entity: string
): EntityQueryKeys<TParams> {
  const all = [entity] as const

  return {
    all,
    lists: () => [entity, 'list'] as const,
    list: (params?: TParams) => [entity, 'list', params] as const,
    details: () => [entity, 'detail'] as const,
    detail: (id: string | number) => [entity, 'detail', id] as const,
    custom: (...subKeys: readonly (string | number | Record<string, unknown>)[]) => [
      entity,
      ...subKeys,
    ],
  }
}
