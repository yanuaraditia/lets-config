import type { RuntimeConfigInput } from './types'

/**
 * Serialise the *public* portion of a runtime config to a JSON string safe
 * for embedding in a `<script>` tag.
 *
 * We strip private (top-level non-`public`) keys so they never reach the
 * client, and we escape characters that could break out of a script tag.
 */
export function serializePublicConfig(config: RuntimeConfigInput): string {
  const publicConfig: { public: Record<string, unknown> } = {
    public: (config.public ?? {}) as Record<string, unknown>,
  }
  return JSON.stringify(publicConfig)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
}

/**
 * Build the inline `<script>` HTML that seeds `window.__RUNTIME_CONFIG__`.
 * Safe to inject into `<head>`.
 */
export function buildConfigScript(config: RuntimeConfigInput): string {
  return `<script>window.__RUNTIME_CONFIG__=${serializePublicConfig(config)}</script>`
}

/**
 * Read the public runtime config that was injected by the Vite plugin /
 * RuntimeConfigScript on the current browser page.
 *
 * Returns `undefined` when called in a non-browser environment and no
 * fallback is provided.
 */
export function readClientConfig(): { public: Record<string, unknown> } | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { __RUNTIME_CONFIG__?: { public: Record<string, unknown> } })
    .__RUNTIME_CONFIG__
}
