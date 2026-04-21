/**
 * Type declarations for the `#runtime-config` Vite virtual module.
 *
 * Add to tsconfig.json:
 *   { "compilerOptions": { "types": ["@yanuaraditia/config/virtual"] } }
 *
 * Or import in a .d.ts file:
 *   /// <reference types="@yanuaraditia/config/virtual" />
 */
declare module '#runtime-config' {
  import type { RuntimeConfig } from '@yanuaraditia/config'
  /** Full runtime config with env-var overrides applied. Server-side only. */
  const config: RuntimeConfig
  export default config
}
