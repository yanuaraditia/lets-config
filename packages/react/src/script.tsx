import React from 'react'
import { serializePublicConfig } from 'lets-config'
import type { RuntimeConfigInput } from 'lets-config'

export interface RuntimeConfigScriptProps {
  /**
   * The runtime config whose **public** portion will be serialised and
   * embedded in the page as `window.__RUNTIME_CONFIG__`.
   *
   * Pass the value from your root loader / `getRuntimeConfig()`.
   */
  config: RuntimeConfigInput
  /**
   * HTML `nonce` attribute for strict Content-Security-Policy environments.
   */
  nonce?: string
}

/**
 * Renders an inline `<script>` tag that seeds `window.__RUNTIME_CONFIG__`
 * with the **public** portion of your runtime config.
 *
 * Place this inside `<head>` in your root layout.  On the server it outputs
 * a real `<script>` tag; on the client it re-uses the already-rendered tag
 * (safe for hydration).
 *
 * @example
 * ```tsx
 * // app/root.tsx — React Router v7 SSR
 * import { getRuntimeConfig } from '@lets-config/react/server'
 * import { RuntimeConfigScript } from '@lets-config/react'
 *
 * export async function loader() {
 *   return { runtimeConfig: getRuntimeConfig() }
 * }
 *
 * export default function Root() {
 *   const { runtimeConfig } = useLoaderData<typeof loader>()
 *   return (
 *     <html>
 *       <head>
 *         <RuntimeConfigScript config={runtimeConfig} />
 *       </head>
 *       <body>…</body>
 *     </html>
 *   )
 * }
 * ```
 */
export function RuntimeConfigScript({ config, nonce }: RuntimeConfigScriptProps) {
  const json = serializePublicConfig(config)
  return React.createElement('script', {
    nonce,
    // dangerouslySetInnerHTML is required for inline scripts in React.
    // The value is JSON-encoded and HTML-escaped in serializePublicConfig.
    dangerouslySetInnerHTML: {
      __html: `window.__RUNTIME_CONFIG__=${json}`,
    },
  })
}
