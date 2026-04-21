import { describe, expect, test } from 'bun:test'
import { applyEnvOverrides } from '../env'

describe('applyEnvOverrides', () => {
  const base = {
    dbUrl: 'postgres://localhost/mydb',
    featureFlag: false,
    count: 5,
    nested: { deep: 'original' },
    public: {
      apiBase: '/api',
      appName: 'MyApp',
      featureFlags: { darkMode: false },
    },
  }

  test('returns a deep clone — does not mutate the original', () => {
    const env = { RUNTIME_DB_URL: 'postgres://new/db' }
    const result = applyEnvOverrides(base, env)
    expect(result).not.toBe(base)
    expect(base.dbUrl).toBe('postgres://localhost/mydb')
  })

  test('overrides a simple private key', () => {
    const result = applyEnvOverrides(base, { RUNTIME_DB_URL: 'postgres://prod/db' })
    expect(result.dbUrl).toBe('postgres://prod/db')
  })

  test('overrides a simple public key', () => {
    const result = applyEnvOverrides(base, { RUNTIME_PUBLIC_API_BASE: '/v2' })
    expect(result.public.apiBase).toBe('/v2')
  })

  test('overrides a multi-word camelCase key', () => {
    const result = applyEnvOverrides(base, { RUNTIME_PUBLIC_APP_NAME: 'NewApp' })
    expect(result.public.appName).toBe('NewApp')
  })

  test('overrides a nested public key via __ separator', () => {
    const result = applyEnvOverrides(base, {
      RUNTIME_PUBLIC_FEATURE_FLAGS__DARK_MODE: 'true',
    })
    expect(result.public.featureFlags.darkMode).toBe(true)
  })

  test('coerces boolean string "true"', () => {
    const result = applyEnvOverrides(base, { RUNTIME_FEATURE_FLAG: 'true' })
    expect(result.featureFlag).toBe(true)
  })

  test('coerces boolean string "false"', () => {
    const result = applyEnvOverrides(base, { RUNTIME_FEATURE_FLAG: 'false' })
    expect(result.featureFlag).toBe(false)
  })

  test('coerces numeric string', () => {
    const result = applyEnvOverrides(base, { RUNTIME_COUNT: '42' })
    expect(result.count).toBe(42)
  })

  test('leaves string values as strings', () => {
    const result = applyEnvOverrides(base, { RUNTIME_DB_URL: 'redis://localhost' })
    expect(typeof result.dbUrl).toBe('string')
  })

  test('skips env vars that do not match any config key', () => {
    const result = applyEnvOverrides(base, { RUNTIME_NONEXISTENT_KEY: 'value' })
    expect(result).toEqual(base)
  })

  test('skips env vars without the prefix', () => {
    const result = applyEnvOverrides(base, { DATABASE_URL: 'postgres://other' })
    expect(result.dbUrl).toBe(base.dbUrl)
  })

  test('skips env vars with undefined values', () => {
    const result = applyEnvOverrides(base, { RUNTIME_DB_URL: undefined })
    expect(result.dbUrl).toBe(base.dbUrl)
  })

  test('respects a custom envPrefix', () => {
    const result = applyEnvOverrides(base, { APP_PUBLIC_API_BASE: '/custom' }, 'APP_')
    expect(result.public.apiBase).toBe('/custom')
  })

  test('handles an empty config gracefully', () => {
    const result = applyEnvOverrides({}, { RUNTIME_ANYTHING: 'value' })
    expect(result).toEqual({})
  })
})
