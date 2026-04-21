import { describe, expect, test } from 'bun:test'
import { defineRuntimeConfig } from '../define'

describe('defineRuntimeConfig', () => {
  test('returns the config object unchanged', () => {
    const input = { dbUrl: 'postgres://localhost/db', public: { apiBase: '/api' } }
    expect(defineRuntimeConfig(input)).toBe(input)
  })

  test('preserves types and nested public object', () => {
    const config = defineRuntimeConfig({
      secretKey: 'abc',
      public: { appName: 'Test', flag: true },
    })
    expect(config.secretKey).toBe('abc')
    expect(config.public.appName).toBe('Test')
    expect(config.public.flag).toBe(true)
  })

  test('accepts an empty config', () => {
    expect(defineRuntimeConfig({})).toEqual({})
  })
})
