import { createContext } from 'react'
import type { RuntimeConfig, ClientRuntimeConfig } from '@runtime-config/core'

// On the server: RuntimeConfig (public + private).
// On the client: ClientRuntimeConfig (public only), sourced from
//   window.__RUNTIME_CONFIG__ or an SSR-injected provider.
export type AnyRuntimeConfig = RuntimeConfig | ClientRuntimeConfig

export const RuntimeConfigContext = createContext<AnyRuntimeConfig | null>(null)
RuntimeConfigContext.displayName = 'RuntimeConfigContext'
