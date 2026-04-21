/**
 * Type declarations for the `virtual:runtime-config` Vite virtual module.
 *
 * Add to tsconfig.json:
 *   { "compilerOptions": { "types": ["@runtime-config/vite/virtual"] } }
 *
 * Or import in a .d.ts file:
 *   /// <reference types="@runtime-config/vite/virtual" />
 */
declare module 'virtual:runtime-config' {
  import type { RuntimeConfig } from '@runtime-config/core'
  /** Full runtime config with env-var overrides applied. Server-side only. */
  const config: RuntimeConfig
  export default config
}
