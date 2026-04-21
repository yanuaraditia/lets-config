/**
 * Server-side runtime config utilities for React Router v7 (and any SSR framework).
 *
 * Import these **only in server code** (loaders, actions, server middleware).
 *
 * `useRuntimeConfig()` returns the **full** config (public + private keys) on the
 * server. Pass it to `<RuntimeConfigProvider>` — the provider automatically strips
 * private keys so they are never accessible in components.
 *
 * @example
 * ```ts
 * // app/root.tsx
 * import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
 *
 * export async function loader() {
 *   const config = useRuntimeConfig()  // full config — server only
 *   return { runtimeConfig: config }   // provider strips private keys for client
 * }
 * ```
 */

import { applyEnvOverrides } from '@yanuaraditia/config'
import type { RuntimeConfigInput, RuntimeConfig } from '@yanuaraditia/config'

let _baseConfig: RuntimeConfigInput | null = null
let _envPrefix = 'RUNTIME_'

/**
 * Register the base (default) config.  Call this once in your app's entry
 * point (server entry or root loader) before using `useRuntimeConfig()`.
 *
 * The base config is usually the output of `defineRuntimeConfig()`.
 *
 * @example
 * ```ts
 * // app/entry.server.tsx  OR  app/root.tsx (top of file)
 * import baseConfig from '~/runtime.config'
 * import { setBaseRuntimeConfig } from '@yanuaraditia/config-react/server'
 *
 * setBaseRuntimeConfig(baseConfig, { envPrefix: 'RUNTIME_' })
 * ```
 */
export function setBaseRuntimeConfig(
  config: RuntimeConfigInput,
  options?: { envPrefix?: string },
): void {
  _baseConfig = config
  if (options?.envPrefix) _envPrefix = options.envPrefix
}

/**
 * Get the full runtime config with environment-variable overrides applied.
 *
 * Use this in loaders, actions, or any server-side code — same API as the
 * client-side `useRuntimeConfig()` hook.
 *
 * Returns `PrivateRuntimeConfig & { public: PublicRuntimeConfig }`.
 */
export function useRuntimeConfig(): RuntimeConfig {
  if (!_baseConfig) {
    return { public: {} } as unknown as RuntimeConfig
  }
  return applyEnvOverrides(
    _baseConfig,
    process.env as Record<string, string | undefined>,
    _envPrefix,
  ) as unknown as RuntimeConfig
}

/** @deprecated Use `useRuntimeConfig()` instead. */
export const getRuntimeConfig = useRuntimeConfig

/**
 * Create a self-contained getter that embeds the base config.
 * Useful when you don't want a shared module-level state.
 *
 * @example
 * ```ts
 * import baseConfig from '~/runtime.config'
 * import { createGetRuntimeConfig } from '@yanuaraditia/config-react/server'
 *
 * export const useRuntimeConfig = createGetRuntimeConfig(baseConfig)
 * ```
 */
export function createGetRuntimeConfig<T extends RuntimeConfigInput>(
  baseConfig: T,
  options?: { envPrefix?: string },
): () => T {
  const prefix = options?.envPrefix ?? 'RUNTIME_'
  return () =>
    applyEnvOverrides(
      baseConfig,
      process.env as Record<string, string | undefined>,
      prefix,
    ) as T
}

export { RuntimeConfigProvider } from './server-provider'
