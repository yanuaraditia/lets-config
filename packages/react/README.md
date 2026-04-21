# `@lets-config/react`

React bindings for `@runtime-config` — `useRuntimeConfig` hook + SSR utilities.

## SPA usage

```tsx
// main.tsx
import { RuntimeConfigProvider } from '@lets-config/react'

createRoot(document.getElementById('root')!).render(
  <RuntimeConfigProvider>
    <App />
  </RuntimeConfigProvider>
)
```

```tsx
// AnyComponent.tsx
import { useRuntimeConfig } from '@lets-config/react'

export function AnyComponent() {
  const config = useRuntimeConfig()
  return <a href={config.public.apiBase}>API</a>
}
```

## React Router v7 (SSR)

```tsx
// app/root.tsx
import { useLoaderData, Outlet } from 'react-router'
import { getRuntimeConfig } from '@lets-config/react/server'
import { RuntimeConfigProvider, RuntimeConfigScript } from '@lets-config/react'

export async function loader() {
  return { runtimeConfig: getRuntimeConfig() }
}

export default function Root() {
  const { runtimeConfig } = useLoaderData<typeof loader>()
  return (
    <html lang="en">
      <head>
        {/* Seeds window.__RUNTIME_CONFIG__ for client hydration */}
        <RuntimeConfigScript config={runtimeConfig} />
      </head>
      <body>
        <RuntimeConfigProvider config={runtimeConfig}>
          <Outlet />
        </RuntimeConfigProvider>
      </body>
    </html>
  )
}
```

```tsx
// app/entry.server.tsx  (register base config once)
import baseConfig from '~/runtime.config'
import { setBaseRuntimeConfig } from '@lets-config/react/server'

setBaseRuntimeConfig(baseConfig)
```

## API

| Export | Description |
|---|---|
| `useRuntimeConfig()` | Hook — returns config from context or `window.__RUNTIME_CONFIG__` |
| `RuntimeConfigProvider` | Context provider — wraps your app |
| `RuntimeConfigScript` | Inline `<script>` that seeds `window.__RUNTIME_CONFIG__` (SSR) |
| `getRuntimeConfig()` *(server)* | Returns full config with env overrides at request time |
| `setBaseRuntimeConfig()` *(server)* | Register your base config once at startup |
| `createGetRuntimeConfig()` *(server)* | Factory for standalone getters |
