import React from 'react'
import { RuntimeConfigScript } from './script'
import { RuntimeConfigContext } from './context'
import { useRuntimeConfig } from './server'
import { readClientConfig } from '@yanuaraditia/config'
import type { AnyRuntimeConfig } from './context'

export interface SSRRuntimeConfigProviderProps {
  children: React.ReactNode
  /** Optional nonce for Content-Security-Policy. */
  nonce?: string
}

/**
 * SSR-aware RuntimeConfigProvider for React Router v7 / Remix apps.
 *
 * Drop it into your root layout — no props, no `useRuntimeConfig`, no
 * `RuntimeConfigScript`. It handles everything automatically:
 *
 * - **Server render**: reads from `useRuntimeConfig()` (populated when you
 *   `import '#runtime-config'` in `entry.server.tsx`) and injects
 *   `window.__RUNTIME_CONFIG__` via an inline `<script>` tag.
 * - **Client hydration / SPA navigation**: reads the already-injected
 *   `window.__RUNTIME_CONFIG__` and re-renders the same script so React
 *   hydration stays in sync.
 *
 * @example
 * ```tsx
 * // app/root.tsx
 * import { RuntimeConfigProvider } from '@yanuaraditia/config-react/server'
 *
 * export default function App() {
 *   return (
 *     <html lang="en">
 *       <head>…</head>
 *       <body>
 *         <RuntimeConfigProvider>
 *           <Outlet />
 *         </RuntimeConfigProvider>
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */
export function RuntimeConfigProvider({ children, nonce }: SSRRuntimeConfigProviderProps) {
  // Server: module-level state set by `import '#runtime-config'` in entry.server.tsx
  // Client: window.__RUNTIME_CONFIG__ injected by the SSR <script> on first load
  const raw: AnyRuntimeConfig =
    typeof window === 'undefined'
      ? (useRuntimeConfig() as unknown as AnyRuntimeConfig)
      : (readClientConfig() ?? { public: {} })

  const publicOnly: AnyRuntimeConfig = { public: (raw as Record<string, unknown>).public ?? {} }

  return React.createElement(
    RuntimeConfigContext.Provider,
    { value: publicOnly },
    // Inline script seeds window.__RUNTIME_CONFIG__ so client components and
    // post-hydration reads always find the value. Same content on server+client
    // → no hydration mismatch.
    React.createElement(RuntimeConfigScript, { config: raw, nonce }),
    children,
  )
}
