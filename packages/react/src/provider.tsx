'use client'

import React from 'react'
import { readClientConfig } from '@yanuaraditia/config'
import { RuntimeConfigContext } from './context'
import type { AnyRuntimeConfig } from './context'

export interface RuntimeConfigProviderProps {
  /**
   * The **public** config to expose to the React tree.
   *
   * Pass the value from `usePublicRuntimeConfig()` in your root loader so that
   * both the server render and client hydration share the same value.
   *
   * ⚠️  Only the `public` key is ever exposed to components. Any private keys
   * on this object are stripped automatically — but to prevent them from being
   * sent over the network in the first place, always use `usePublicRuntimeConfig()`
   * (not `useRuntimeConfig()`) when building your loader return value.
   *
   * Omit this prop in SPA mode — the provider reads `window.__RUNTIME_CONFIG__`
   * that was injected by the Vite plugin or `<RuntimeConfigScript>`.
   */
  config?: AnyRuntimeConfig
  children: React.ReactNode
}

/**
 * Provides the runtime config to the entire React tree.
 *
 * ### SPA usage
 * ```tsx
 * // main.tsx
 * createRoot(document.getElementById('root')!).render(
 *   <RuntimeConfigProvider>
 *     <App />
 *   </RuntimeConfigProvider>
 * )
 * ```
 *
 * ### React Router v7 SSR usage
 * ```tsx
 * // app/root.tsx
 * import { usePublicRuntimeConfig } from '@yanuaraditia/config-react/server'
 *
 * export async function loader() {
 *   // usePublicRuntimeConfig strips private keys before they reach the client
 *   return { runtimeConfig: usePublicRuntimeConfig() }
 * }
 *
 * export default function Root() {
 *   const { runtimeConfig } = useLoaderData<typeof loader>()
 *   return (
 *     <RuntimeConfigProvider config={runtimeConfig}>
 *       <Outlet />
 *     </RuntimeConfigProvider>
 *   )
 * }
 * ```
 */
export function RuntimeConfigProvider({ config, children }: RuntimeConfigProviderProps) {
  // Resolve the raw value from the prop or window.__RUNTIME_CONFIG__
  const raw: AnyRuntimeConfig = config ?? readClientConfig() ?? { public: {} }

  // Strip private keys — only expose the `public` portion to components.
  // This is a safety net; private keys should never reach here in the first
  // place (use usePublicRuntimeConfig() in your loader).
  const value: AnyRuntimeConfig = { public: (raw as Record<string, unknown>).public ?? {} }

  return React.createElement(
    RuntimeConfigContext.Provider,
    { value },
    children,
  )
}
