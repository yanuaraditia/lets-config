import { describe, expect, test, beforeEach, afterEach } from 'bun:test'
import { serializePublicConfig, buildConfigScript, readClientConfig } from '../serialize'

describe('serializePublicConfig', () => {
  test('serialises only the public portion', () => {
    const config = { secret: 'hidden', public: { apiBase: '/api' } }
    const json = serializePublicConfig(config)
    const parsed = JSON.parse(json)
    expect(parsed).toEqual({ public: { apiBase: '/api' } })
    expect(parsed.secret).toBeUndefined()
  })

  test('handles missing public key with empty object', () => {
    const json = serializePublicConfig({})
    expect(JSON.parse(json)).toEqual({ public: {} })
  })

  test('escapes < to prevent script tag injection', () => {
    const config = { public: { val: '</script><script>alert(1)</script>' } }
    const json = serializePublicConfig(config)
    expect(json).not.toContain('</')
    expect(json).toContain('\\u003c')
  })

  test('escapes > characters', () => {
    const json = serializePublicConfig({ public: { x: '>' } })
    expect(json).toContain('\\u003e')
  })

  test('escapes & characters', () => {
    const json = serializePublicConfig({ public: { x: '&amp;' } })
    expect(json).toContain('\\u0026')
  })

  test("escapes ' characters", () => {
    const json = serializePublicConfig({ public: { x: "it's" } })
    expect(json).toContain('\\u0027')
  })

  test('preserves nested public values', () => {
    const config = { public: { flags: { dark: true }, count: 3 } }
    const parsed = JSON.parse(serializePublicConfig(config))
    expect(parsed.public.flags.dark).toBe(true)
    expect(parsed.public.count).toBe(3)
  })
})

describe('buildConfigScript', () => {
  test('wraps serialized config in a <script> tag', () => {
    const script = buildConfigScript({ public: { apiBase: '/api' } })
    expect(script).toMatch(/^<script>window\.__RUNTIME_CONFIG__=/)
    expect(script).toMatch(/<\/script>$/)
  })

  test('the embedded JSON is parseable', () => {
    const script = buildConfigScript({ public: { key: 'value' } })
    const match = script.match(/window\.__RUNTIME_CONFIG__=(.+)<\/script>/)
    expect(match).not.toBeNull()
    const parsed = JSON.parse(match![1])
    expect(parsed.public.key).toBe('value')
  })
})

describe('readClientConfig', () => {
  let savedWindow: Window & typeof globalThis | undefined

  beforeEach(() => {
    savedWindow = globalThis.window as typeof savedWindow
    // Install a minimal fake window so readClientConfig sees a browser-like env
    globalThis.window = {} as Window & typeof globalThis
  })

  afterEach(() => {
    globalThis.window = savedWindow as Window & typeof globalThis
  })

  test('returns undefined when __RUNTIME_CONFIG__ is not set', () => {
    expect(readClientConfig()).toBeUndefined()
  })

  test('returns window.__RUNTIME_CONFIG__ when set', () => {
    const config = { public: { apiBase: '/api' } }
    ;(globalThis.window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__ = config
    expect(readClientConfig()).toEqual(config)
  })

  test('returns undefined in a non-browser environment (no window)', () => {
    // Temporarily remove window
    const win = globalThis.window
    // @ts-expect-error intentional
    delete globalThis.window
    expect(readClientConfig()).toBeUndefined()
    globalThis.window = win
  })
})
