// ─── User-extendable interfaces ─────────────────────────────────────────────

/**
 * Extend this interface to add your private (server-only) config keys.
 *
 * @example
 * declare module '@yanuaraditia/config' {
 *   interface PrivateRuntimeConfig {
 *     dbUrl: string
 *     secretKey: string
 *   }
 * }
 */
export interface PrivateRuntimeConfig {
  [key: string]: unknown
}

/**
 * Extend this interface to add your public (client + server) config keys.
 *
 * @example
 * declare module '@yanuaraditia/config' {
 *   interface PublicRuntimeConfig {
 *     apiBase: string
 *     appName: string
 *   }
 * }
 */
export interface PublicRuntimeConfig {
  [key: string]: unknown
}

// ─── Composed types ──────────────────────────────────────────────────────────

/** Full runtime config (server-side: public + private). */
export type RuntimeConfig = PrivateRuntimeConfig & { public: PublicRuntimeConfig }

/** Client-side config: only the public portion. */
export type ClientRuntimeConfig = { public: PublicRuntimeConfig }

// ─── defineRuntimeConfig input type ─────────────────────────────────────────

export type RuntimeConfigInput = PrivateRuntimeConfig & {
  public?: Partial<PublicRuntimeConfig>
}

// ─── Options ─────────────────────────────────────────────────────────────────
// RuntimeConfigPluginOptions lives in @yanuaraditia/config-vite (vite-specific)
