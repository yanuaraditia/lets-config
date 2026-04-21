/**
 * Server-side runtime config utilities for React Router v7 (and any SSR framework).
 *
 * Import these **only in server code** (loaders, actions, server middleware).
 * They read from `process.env` so they work in Node.js and edge runtimes.
 *
 * @example
 * ```ts
 * // app/root.tsx
 * import { getRuntimeConfig } from '@lets-config/react/server'
 *
 * export async function loader() {
 *   const config = getRuntimeConfig()   // reads process.env at request time
 *   return { runtimeConfig: config }
 * }
 * ```
 */

import { applyEnvOverrides } from 'lets-config'
import type { RuntimeConfigInput, RuntimeConfig } from 'lets-config'

let _baseConfig: RuntimeConfigInput | null = null
let _envPrefix = 'RUNTIME_'

/**
 * Register the base (default) config.  Call this once in your app's entry
 * point (server entry or root loader) before using `getRuntimeConfig()`.
 *
 * The base config is usually the output of `defineRuntimeConfig()`.
 *
 * @example
 * ```ts
 * // app/entry.server.tsx  OR  app/root.tsx (top of file)
 * import baseConfig from '~/runtime.config'
 * import { setBaseRuntimeConfig } from '@lets-config/react/server'
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
 * Call this inside loaders, actions, or any server-side code.
 * Returns `PrivateRuntimeConfig & { public: PublicRuntimeConfig }`.
 */
export function getRuntimeConfig(): RuntimeConfig {
  if (!_baseConfig) {
    // If setBaseRuntimeConfig was never called, return an empty config rather
    // than crashing.  The Vite plugin's virtual module populates _baseConfig
    // automatically when the SSR entry is loaded.
    return { public: {} } as unknown as RuntimeConfig
  }
  return applyEnvOverrides(
    _baseConfig,
    process.env as Record<string, string | undefined>,
    _envPrefix,
  ) as unknown as RuntimeConfig
}

/**
 * Create a self-contained getter that embeds the base config.
 * Useful when you don't want a shared module-level state.
 *
 * @example
 * ```ts
 * import baseConfig from '~/runtime.config'
 * import { createGetRuntimeConfig } from '@lets-config/react/server'
 *
 * export const getRuntimeConfig = createGetRuntimeConfig(baseConfig)
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
