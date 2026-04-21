'use client'

import React from 'react'
import { readClientConfig } from '@runtime-config/core'
import { RuntimeConfigContext } from './context'
import type { AnyRuntimeConfig } from './context'

export interface RuntimeConfigProviderProps {
  /**
   * The config to expose.
   *
   * - **Client/SPA**: omit this — the provider reads `window.__RUNTIME_CONFIG__`
   *   that was injected by the Vite plugin or `<RuntimeConfigScript>`.
   * - **SSR (React Router v7)**: pass the config returned by your root loader
   *   so both server-render and hydration share the same value.
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
 * import { getRuntimeConfig } from '@runtime-config/react/server'
 *
 * export async function loader() {
 *   return { runtimeConfig: getRuntimeConfig() }
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
  // Prefer explicit prop; fall back to window.__RUNTIME_CONFIG__ (SPA / hydration)
  const value: AnyRuntimeConfig = config ?? readClientConfig() ?? { public: {} }

  return React.createElement(
    RuntimeConfigContext.Provider,
    { value },
    children,
  )
}
