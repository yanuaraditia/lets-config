'use client'

import { useContext } from 'react'
import { RuntimeConfigContext } from './context'
import type { AnyRuntimeConfig } from './context'
import type { RuntimeConfig, ClientRuntimeConfig } from '@runtime-config/core'

/**
 * Access the runtime config from anywhere in your React tree.
 *
 * On the **server** (SSR), the hook returns the full `RuntimeConfig` that was
 * passed to `<RuntimeConfigProvider config={...}>`.
 *
 * On the **client**, it returns the public portion that was injected by the
 * Vite plugin (`window.__RUNTIME_CONFIG__`) or an SSR provider.
 *
 * @example
 * ```tsx
 * function ApiClient() {
 *   const config = useRuntimeConfig()
 *   return <span>{config.public.apiBase}</span>
 * }
 * ```
 */
export function useRuntimeConfig(): AnyRuntimeConfig {
  const ctx = useContext(RuntimeConfigContext)

  if (ctx !== null) return ctx

  // Outside a provider (e.g. during SPA hydration before React mounts):
  // try window.__RUNTIME_CONFIG__ as a last resort.
  if (typeof window !== 'undefined') {
    const win = window as unknown as {
      __RUNTIME_CONFIG__?: ClientRuntimeConfig
    }
    if (win.__RUNTIME_CONFIG__) return win.__RUNTIME_CONFIG__
  }

  // SSR without a provider — return an empty config so the app doesn't crash.
  return { public: {} } as ClientRuntimeConfig
}

/**
 * Typed variant: useRuntimeConfig() narrowed to the full server RuntimeConfig.
 * Only call this in code that runs exclusively on the server (e.g. loaders).
 */
export function useServerRuntimeConfig(): RuntimeConfig {
  return useRuntimeConfig() as RuntimeConfig
}
