import { describe, it, expect } from 'vitest'
import { env } from '@/config/env'

describe('Environment Configuration', () => {
  it('exposes validated environment properties', () => {
    expect(env).toBeDefined()
    expect(typeof env.apiBaseUrl).toBe('string')
    expect(env.apiBaseUrl.length).toBeGreaterThan(0)
    expect(env.apiBaseUrl.endsWith('/')).toBe(false)
    expect(typeof env.isProduction).toBe('boolean')
    expect(typeof env.isDevelopment).toBe('boolean')
  })
})
