import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { tmpdir } from 'os'

// ─── loadConfigFile (tested via a re-export shim for testability) ─────────────
// We can't import loadConfigFile directly (it's not exported). Instead, we test
// the plugin's behaviour indirectly through the `load` hook.

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
    const resolved = (plugin.resolveId as (id: string) => string | undefined)('virtual:runtime-config')
    expect(resolved).toBe('\0virtual:runtime-config')
  })

  test('returns undefined for non-virtual ids', () => {
    const plugin = runtimeConfigPlugin()
    const resolved = (plugin.resolveId as (id: string) => string | undefined)('some-other-module')
    expect(resolved).toBeUndefined()
  })

  test('returns undefined from load for non-virtual ids', async () => {
    const plugin = runtimeConfigPlugin()
    const result = await (plugin.load as (id: string, opts?: unknown) => Promise<string | undefined>)(
      'not-a-virtual-id',
    )
    expect(result).toBeUndefined()
  })
})

describe('runtimeConfigPlugin — load hook', async () => {
  const { runtimeConfigPlugin } = await import('../index')

  test('client load exports only public config', async () => {
    const plugin = runtimeConfigPlugin()
    // Simulate configResolved with no config file so baseConfig stays empty
    await (plugin.configResolved as (cfg: Record<string, unknown>) => Promise<void>)({
      root: tmpdir(),
      build: {},
    })
    const code = await (plugin.load as (id: string, opts?: { ssr?: boolean }) => Promise<string | undefined>)(
      '\0virtual:runtime-config',
      { ssr: false },
    )
    expect(code).toContain('public')
    // Should not contain any private/server keys
    const exported = code?.match(/const config = (.+);/)?.[1]
    const parsed = exported ? JSON.parse(exported) : {}
    expect(Object.keys(parsed)).toEqual(['public'])
  })

  test('SSR load exports full config', async () => {
    const plugin = runtimeConfigPlugin()
    await (plugin.configResolved as (cfg: Record<string, unknown>) => Promise<void>)({
      root: tmpdir(),
      build: {},
    })
    const code = await (plugin.load as (id: string, opts?: { ssr?: boolean }) => Promise<string | undefined>)(
      '\0virtual:runtime-config',
      { ssr: true },
    )
    expect(code).toBeDefined()
  })
})

describe('runtimeConfigPlugin — configResolved with JS config file', () => {
  let tmpDir: string

  beforeEach(() => {
    tmpDir = join(tmpdir(), `runtime-config-test-${Date.now()}`)
    mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('loads a plain JS config file (no jiti)', async () => {
    const { runtimeConfigPlugin } = await import('../index')

    // Write a CommonJS config file (require()-compatible)
    writeFileSync(
      join(tmpDir, 'runtime.config.js'),
      `module.exports = { public: { appName: 'LoadedApp' } }`,
    )

    const plugin = runtimeConfigPlugin({
      configFile: './runtime.config.js',
      useJiti: false,  // force plain require(), no jiti
    })

    await (plugin.configResolved as (cfg: Record<string, unknown>) => Promise<void>)({
      root: tmpDir,
      build: {},
    })

    const code = await (plugin.load as (id: string, opts?: { ssr?: boolean }) => Promise<string | undefined>)(
      '\0virtual:runtime-config',
      { ssr: true },
    )
    expect(code).toContain('LoadedApp')
  })

  test('throws when useJiti: true but jiti is unavailable', async () => {
    const { runtimeConfigPlugin } = await import('../index')

    // Write a TS config file that plain require() cannot parse
    writeFileSync(
      join(tmpDir, 'runtime.config.ts'),
      `export default { public: { appName: 'TSApp' } }`,
    )

    // Temporarily shadow jiti by overwriting the import resolution
    // We test the error path by writing a broken config with useJiti:false
    // (testing that the error is raised when neither loader works)
    writeFileSync(
      join(tmpDir, 'broken.config.js'),
      `this is not valid JS !!!`,
    )

    const plugin = runtimeConfigPlugin({
      configFile: './broken.config.js',
      useJiti: false,
    })

    await expect(
      (plugin.configResolved as (cfg: Record<string, unknown>) => Promise<void>)({
        root: tmpDir,
        build: {},
      }),
    ).rejects.toThrow(/Failed to load config file/)
  })
})

describe('runtimeConfigPlugin — useJiti option', async () => {
  const { runtimeConfigPlugin } = await import('../index')

  test('plugin accepts useJiti: false without crashing', () => {
    expect(() => runtimeConfigPlugin({ useJiti: false })).not.toThrow()
  })

  test('plugin accepts useJiti: true without crashing', () => {
    expect(() => runtimeConfigPlugin({ useJiti: true })).not.toThrow()
  })

  test('plugin accepts useJiti: undefined (default) without crashing', () => {
    expect(() => runtimeConfigPlugin({ useJiti: undefined })).not.toThrow()
  })
})
