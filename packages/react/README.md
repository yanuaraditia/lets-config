# `@yanuaraditia/config-react`

React bindings for `@yanuaraditia/config` — `useRuntimeConfig` hook + SSR utilities.

## SPA usage

```tsx
// main.tsx
import { RuntimeConfigProvider } from '@yanuaraditia/config-react'

createRoot(document.getElementById('root')!).render(
  <RuntimeConfigProvider>
    <App />
  </RuntimeConfigProvider>
)
```

```tsx
// AnyComponent.tsx
import { useRuntimeConfig } from '@yanuaraditia/config-react'

export function AnyComponent() {
  const config = useRuntimeConfig()
  return <a href={config.public.apiBase}>API</a>
}
```

## React Router v7 (SSR)

Register the base config once at server startup, then `useRuntimeConfig()` works
in any component — **no loader required** for public config.

```tsx
// app/entry.server.tsx  (register once, at module load time)
import baseConfig from '~/runtime.config'
import { setBaseRuntimeConfig } from '@yanuaraditia/config-react/server'

setBaseRuntimeConfig(baseConfig)
```

```tsx
// app/root.tsx — RuntimeConfigScript seeds window.__RUNTIME_CONFIG__ for the client
import { Outlet } from 'react-router'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import { RuntimeConfigProvider, RuntimeConfigScript } from '@yanuaraditia/config-react'

export default function Root() {
  // Reads process.env at render time — no loader needed
  const config = useRuntimeConfig()
  return (
    <html lang="en">
      <head>
        <RuntimeConfigScript config={config} />
      </head>
      <body>
        <RuntimeConfigProvider config={config}>
          <Outlet />
        </RuntimeConfigProvider>
      </body>
    </html>
  )
}
```

```tsx
// Any component — reads from window.__RUNTIME_CONFIG__ or the provider
import { useRuntimeConfig } from '@yanuaraditia/config-react'

export function AppHeader() {
  const config = useRuntimeConfig()
  return <span>{config.public.appVersion}</span>
}
```

Need private config in a loader? Use the server import there:

```ts
// app/routes/dashboard.tsx
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'

export async function loader() {
  const { dbUrl } = useRuntimeConfig()  // private — never reaches the browser
  const data = await fetchFromDb(dbUrl)
  return { data }
}
```
## Shopify App (React Router v7)

Works with `@shopify/shopify-app-react-router` out of the box.
`RuntimeConfigProvider` can sit inside or outside Shopify's `AppProvider` — both work.

```tsx
// app/root.tsx — no loader needed for public config
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'
import { AppProvider } from '@shopify/polaris'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import { RuntimeConfigProvider, RuntimeConfigScript } from '@yanuaraditia/config-react'

export default function App() {
  const config = useRuntimeConfig()  // reads process.env at render time
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <RuntimeConfigScript config={config} />
      </head>
      <body>
        <RuntimeConfigProvider config={config}>
          <AppProvider i18n={{}}>
            <Outlet />
          </AppProvider>
        </RuntimeConfigProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
```

```tsx
// app/routes/app._index.tsx — private config stays on the server
import { authenticate } from '~/shopify.server'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import type { LoaderFunctionArgs } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request)
  const { shopifyApiKey } = useRuntimeConfig()  // private — never returned to client
  const data = await callSomeApi(shopifyApiKey)
  return { data }
}
```

```tsx
// Any component — just call useRuntimeConfig(), no loader or prop drilling needed
import { useRuntimeConfig } from '@yanuaraditia/config-react'

export function AppHeader() {
  const config = useRuntimeConfig()
  return <h1>{config.public.appName}</h1>
}
```
## API

| Export | Description |
|---|---|
| `useRuntimeConfig()` *(client)* | Hook — returns public config from context or `window.__RUNTIME_CONFIG__` |
| `RuntimeConfigProvider` | Context provider — exposes public config to the React tree |
| `RuntimeConfigScript` | Inline `<script>` that seeds `window.__RUNTIME_CONFIG__` (SSR) |
| `useRuntimeConfig()` *(server)* | Returns **full** config (public + private) — use in loaders/actions only |
| `setBaseRuntimeConfig()` *(server)* | Register your base config once at startup |
| `createGetRuntimeConfig()` *(server)* | Factory for standalone getters |

