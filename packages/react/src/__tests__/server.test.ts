/**
 * Server-side runtime config utilities tests.
 *
 * We re-import the module fresh for each describe block to reset module-level
 * state (_baseConfig, _envPrefix) using `jest.resetModules()` / dynamic import.
 */
import { describe, expect, test, beforeEach, afterEach } from 'bun:test'

// ─── helpers ─────────────────────────────────────────────────────────────────

/** Save and restore process.env around a test. */
function withEnv(vars: Record<string, string>, fn: () => void): void {
  const saved: Record<string, string | undefined> = {}
  for (const [k, v] of Object.entries(vars)) {
    saved[k] = process.env[k]
    process.env[k] = v
  }
  try {
    fn()
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  }
}

// ─── setBaseRuntimeConfig + useRuntimeConfig ──────────────────────────────────

describe('setBaseRuntimeConfig / useRuntimeConfig', () => {
  // Import the live module — state persists across tests in the same worker
  let setBaseRuntimeConfig: (
    config: Record<string, unknown>,
    opts?: { envPrefix?: string },
  ) => void
  let useRuntimeConfig: () => Record<string, unknown>

  beforeEach(async () => {
    // Dynamic re-import so Bun re-evaluates the module and resets module state
    const mod = await import('../server')
    setBaseRuntimeConfig = mod.setBaseRuntimeConfig as typeof setBaseRuntimeConfig
    useRuntimeConfig = mod.useRuntimeConfig as typeof useRuntimeConfig
    // Reset state by setting an empty base config
    setBaseRuntimeConfig({})
  })

  test('returns empty public config when no base config is set', () => {
    // @ts-expect-error accessing internals via the exported reset
    setBaseRuntimeConfig(null as unknown as Record<string, unknown>)
    const config = useRuntimeConfig()
    expect(config).toEqual({ public: {} })
  })

  test('returns base config values', () => {
    setBaseRuntimeConfig({ dbUrl: 'postgres://localhost', public: { apiBase: '/api' } })
    const config = useRuntimeConfig()
    expect((config as Record<string, unknown>).dbUrl).toBe('postgres://localhost')
    expect((config as unknown as { public: { apiBase: string } }).public.apiBase).toBe('/api')
  })

  test('applies env overrides on top of base config', () => {
    setBaseRuntimeConfig({ dbUrl: 'original', public: { apiBase: '/api' } })
    withEnv({ RUNTIME_DB_URL: 'overridden', RUNTIME_PUBLIC_API_BASE: '/v2' }, () => {
      const config = useRuntimeConfig() as Record<string, unknown>
      expect(config.dbUrl).toBe('overridden')
      expect((config.public as Record<string, unknown>).apiBase).toBe('/v2')
    })
  })

  test('respects custom envPrefix from setBaseRuntimeConfig', () => {
    setBaseRuntimeConfig({ public: { name: 'old' } }, { envPrefix: 'APP_' })
    withEnv({ APP_PUBLIC_NAME: 'new' }, () => {
      const config = useRuntimeConfig() as { public: { name: string } }
      expect(config.public.name).toBe('new')
    })
  })

  test('does not leak env overrides to next call', () => {
    setBaseRuntimeConfig({ public: { name: 'base' } })
    withEnv({ RUNTIME_PUBLIC_NAME: 'override' }, () => {
      useRuntimeConfig()
    })
    const config = useRuntimeConfig() as { public: { name: string } }
    expect(config.public.name).toBe('base')
  })
})

// ─── getRuntimeConfig (deprecated alias) ─────────────────────────────────────

describe('getRuntimeConfig (deprecated alias)', () => {
  test('is exported and equals useRuntimeConfig', async () => {
    const mod = await import('../server')
    expect(mod.getRuntimeConfig).toBe(mod.useRuntimeConfig)
  })
})

// ─── createGetRuntimeConfig ───────────────────────────────────────────────────

describe('createGetRuntimeConfig', () => {
  let createGetRuntimeConfig: (
    config: Record<string, unknown>,
    opts?: { envPrefix?: string },
  ) => () => Record<string, unknown>

  beforeEach(async () => {
    const mod = await import('../server')
    createGetRuntimeConfig = mod.createGetRuntimeConfig as typeof createGetRuntimeConfig
  })

  test('returns a getter that reads current env values each call', () => {
    const getter = createGetRuntimeConfig({ public: { val: 'original' } })
    withEnv({ RUNTIME_PUBLIC_VAL: 'from-env' }, () => {
      const result = getter() as { public: { val: string } }
      expect(result.public.val).toBe('from-env')
    })
    const result = getter() as { public: { val: string } }
    expect(result.public.val).toBe('original')
  })

  test('respects custom envPrefix option', () => {
    const getter = createGetRuntimeConfig({ public: { x: 'default' } }, { envPrefix: 'CFG_' })
    withEnv({ CFG_PUBLIC_X: 'custom' }, () => {
      const result = getter() as { public: { x: string } }
      expect(result.public.x).toBe('custom')
    })
  })

  test('does not share state with module-level base config', async () => {
    const mod = await import('../server')
    mod.setBaseRuntimeConfig({ public: { shared: 'module-level' } })
    const getter = createGetRuntimeConfig({ public: { shared: 'standalone' } })
    const result = getter() as { public: { shared: string } }
    expect(result.public.shared).toBe('standalone')
  })
})

// ─── afterEach cleanup ────────────────────────────────────────────────────────

afterEach(() => {
  // Remove any RUNTIME_* vars that tests may have leaked
  for (const key of Object.keys(process.env)) {
    if (key.startsWith('RUNTIME_') || key.startsWith('APP_') || key.startsWith('CFG_')) {
      delete process.env[key]
    }
  }
})
