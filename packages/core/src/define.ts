import type { RuntimeConfigInput } from './types'

/**
 * Define your runtime config with full type inference.
 *
 * @example
 * // runtime.config.ts
 * import { defineRuntimeConfig } from '@runtime-config/core'
 *
 * export default defineRuntimeConfig({
 *   dbUrl: process.env.DATABASE_URL ?? '',   // server-only
 *   public: {
 *     apiBase: '/api',
 *     appName: 'My App',
 *   },
 * })
 */
export function defineRuntimeConfig<T extends RuntimeConfigInput>(config: T): T {
  return config
}
