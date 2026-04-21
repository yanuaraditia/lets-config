'use client'

import { useContext } from 'react'
import { RuntimeConfigContext } from './context'
import type { ClientRuntimeConfig } from '@yanuaraditia/config'

/**
 * Returns the **public** runtime config from the nearest `RuntimeConfigProvider`
 * or from `window.__RUNTIME_CONFIG__` (injected by the Vite plugin / `<RuntimeConfigScript>`).
 *
 * Private keys are never available here — they exist only on the server.
 * TypeScript enforces this: accessing anything outside `config.public` is a compile error.
 *
 * ```tsx
 * function ApiClient() {
 *   const { public: { apiBase } } = useRuntimeConfig()
 *   return <span>{apiBase}</span>
 * }
 * ```
 */
export function useRuntimeConfig(): ClientRuntimeConfig {
  const ctx = useContext(RuntimeConfigContext)

  if (ctx !== null) return ctx as ClientRuntimeConfig

  // Outside a provider (SPA before React mounts): try window.__RUNTIME_CONFIG__
  if (typeof window !== 'undefined') {
    const win = window as unknown as { __RUNTIME_CONFIG__?: ClientRuntimeConfig }
    if (win.__RUNTIME_CONFIG__) return win.__RUNTIME_CONFIG__
  }

  return { public: {} } as ClientRuntimeConfig
}
