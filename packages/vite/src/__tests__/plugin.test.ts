import { describe, expect, test } from 'bun:test'
import { tmpdir } from 'os'

describe('runtimeConfigPlugin — plugin shape', async () => {
  const { runtimeConfigPlugin } = await import('../index')

  test('returns a Vite plugin object with the correct name', () => {
    const plugin = runtimeConfigPlugin()
    expect(plugin.name).toBe('runtime-config')
  })

  test('enforces "pre" execution order', () => {
    const plugin = runtimeConfigPlugin()
    expect(plugin.enforce).toBe('pre')
  })

  test('resolves the virtual module id', () => {
    const plugin = runtimeConfigPlugin()
    const resolved = (plugin.resolveId as (id: string) => string | undefined)('#runtime-config')
    expect(resolved).toBe('\0#runtime-config')
  })

  test('returns undefined for non-virtual ids', () => {
    const plugin = runtimeConfigPlugin()
    const resolved = (plugin.resolveId as (id: string) => string | undefined)('some-other-module')
    expect(resolved).toBeUndefined()
  })

  test('returns undefined from load for non-virtual ids', () => {
    const plugin = runtimeConfigPlugin()
    const result = (plugin.load as (id: string, opts?: unknown) => string | undefined)('not-a-virtual-id')
    expect(result).toBeUndefined()
  })
})

describe('runtimeConfigPlugin — inline config', async () => {
  const { runtimeConfigPlugin } = await import('../index')

  test('client load exports only public config', () => {
    const plugin = runtimeConfigPlugin({
      config: { dbUrl: 'postgres://...', public: { appName: 'MyApp' } },
    })
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: false },
    )
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(Object.keys(parsed)).toEqual(['public'])
    expect(parsed.public.appName).toBe('MyApp')
    expect(parsed.dbUrl).toBeUndefined()
  })

  test('SSR load auto-registers config and exports full config including private keys', () => {
    const plugin = runtimeConfigPlugin({
      config: { dbUrl: 'postgres://secret', public: { appName: 'MyApp' } },
    })
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: true },
    )
    // SSR module auto-registers via setBaseRuntimeConfig
    expect(code).toContain(`import { setBaseRuntimeConfig } from '@yanuaraditia/config-react/server'`)
    expect(code).toContain('setBaseRuntimeConfig(config)')
    expect(code).toContain('export default config')
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(parsed.dbUrl).toBe('postgres://secret')
    expect(parsed.public.appName).toBe('MyApp')
  })

  test('empty config works without errors', () => {
    const plugin = runtimeConfigPlugin()
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: false },
    )
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(parsed).toEqual({ public: {} })
  })

  test('defineRuntimeConfig re-export works', async () => {
    const { defineRuntimeConfig } = await import('../index')
    const config = defineRuntimeConfig({ public: { appVersion: '2.0.0' } })
    expect(config.public?.appVersion).toBe('2.0.0')
  })
})

describe('runtimeConfigPlugin — env var overrides', async () => {
  const { runtimeConfigPlugin } = await import('../index')

  test('applies env var overrides to public config', () => {
    process.env.RUNTIME_PUBLIC_APP_NAME = 'EnvApp'
    const plugin = runtimeConfigPlugin({
      config: { public: { appName: 'DefaultApp' } },
    })
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: false },
    )
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(parsed.public.appName).toBe('EnvApp')
    delete process.env.RUNTIME_PUBLIC_APP_NAME
  })

  test('SSR load uses base config (env overrides applied at request time by useRuntimeConfig)', () => {
    process.env.RUNTIME_DB_URL = 'postgres://from-env'
    const plugin = runtimeConfigPlugin({
      config: { dbUrl: 'postgres://default' },
    })
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: true },
    )
    // SSR module stores the base (build-time) config; useRuntimeConfig() applies RUNTIME_ overrides at request time
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(parsed.dbUrl).toBe('postgres://default')
    delete process.env.RUNTIME_DB_URL
  })

  test('custom envPrefix is respected', () => {
    process.env.APP_PUBLIC_VERSION = '3.0.0'
    const plugin = runtimeConfigPlugin({
      config: { public: { version: '1.0.0' } },
      envPrefix: 'APP_',
    })
    ;(plugin.configResolved as (cfg: Record<string, unknown>) => void)({ root: tmpdir(), build: {} })

    const code = (plugin.load as (id: string, opts?: { ssr?: boolean }) => string | undefined)(
      '\0#runtime-config',
      { ssr: false },
    )
    const parsed = JSON.parse(code!.match(/const config = (.+);/)?.[1]!)
    expect(parsed.public.version).toBe('3.0.0')
    delete process.env.APP_PUBLIC_VERSION
  })
})
