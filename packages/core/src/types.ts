// ─── User-extendable interfaces ─────────────────────────────────────────────

/**
 * Extend this interface to add your private (server-only) config keys.
 *
 * @example
 * declare module '@runtime-config/core' {
 *   interface PrivateRuntimeConfig {
 *     dbUrl: string
 *     secretKey: string
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrivateRuntimeConfig {}

/**
 * Extend this interface to add your public (client + server) config keys.
 *
 * @example
 * declare module '@runtime-config/core' {
 *   interface PublicRuntimeConfig {
 *     apiBase: string
 *     appName: string
 *   }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PublicRuntimeConfig {}

// ─── Composed types ──────────────────────────────────────────────────────────

/** Full runtime config (server-side: public + private). */
export type RuntimeConfig = PrivateRuntimeConfig & { public: PublicRuntimeConfig }

/** Client-side config: only the public portion. */
export type ClientRuntimeConfig = { public: PublicRuntimeConfig }

// ─── defineRuntimeConfig input type ─────────────────────────────────────────

export type RuntimeConfigInput = PrivateRuntimeConfig & {
  public?: Partial<PublicRuntimeConfig> & Record<string, unknown>
} & Record<string, unknown>

// ─── Options ─────────────────────────────────────────────────────────────────

export interface RuntimeConfigPluginOptions {
  /**
   * Path to your runtime config file (relative to project root).
   * @default './runtime.config.ts'
   */
  configFile?: string

  /**
   * Environment variable prefix used for overrides.
   *
   * Convention (mirrors Nuxt):
   *   {PREFIX}PUBLIC_{KEY}  →  config.public.key
   *   {PREFIX}{KEY}         →  config.key  (private / server-only)
   *
   * @default 'RUNTIME_'
   */
  envPrefix?: string

  /**
   * When true, the Vite plugin writes a `runtime-config.d.ts` file next to
   * your config file so you get typed module augmentation automatically.
   * @default false
   */
  generateTypes?: boolean
}
