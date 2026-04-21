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

```tsx
// app/entry.server.tsx  (register base config once, at module load time)
import baseConfig from '~/runtime.config'
import { setBaseRuntimeConfig } from '@yanuaraditia/config-react/server'

setBaseRuntimeConfig(baseConfig)
```

```tsx
// app/root.tsx
import { useLoaderData, Outlet } from 'react-router'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import { RuntimeConfigProvider, RuntimeConfigScript } from '@yanuaraditia/config-react'

export async function loader() {
  return { runtimeConfig: useRuntimeConfig() }
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

## Shopify App (React Router v7)

Works with `@shopify/shopify-app-react-router` out of the box.
`RuntimeConfigProvider` can sit inside or outside Shopify's `AppProvider` — both work.

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from 'react-router'
import { AppProvider } from '@shopify/polaris'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import { RuntimeConfigProvider, RuntimeConfigScript } from '@yanuaraditia/config-react'

export async function loader() {
  return { runtimeConfig: useRuntimeConfig() }
}

export default function App() {
  const { runtimeConfig } = useLoaderData<typeof loader>()
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <RuntimeConfigScript config={runtimeConfig} />
      </head>
      <body>
        <RuntimeConfigProvider config={runtimeConfig}>
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
// app/routes/app._index.tsx — runtime config + Shopify auth together
import { authenticate } from '~/shopify.server'
import { useRuntimeConfig } from '@yanuaraditia/config-react/server'
import type { LoaderFunctionArgs } from 'react-router'

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request)
  const { shopifyApiKey, public: publicConfig } = useRuntimeConfig()
  return { shopifyApiKey, publicConfig }
}
```

## API

| Export | Description |
|---|---|
| `useRuntimeConfig()` | Hook — returns config from context or `window.__RUNTIME_CONFIG__` |
| `RuntimeConfigProvider` | Context provider — wraps your app |
| `RuntimeConfigScript` | Inline `<script>` that seeds `window.__RUNTIME_CONFIG__` (SSR) |
| `useRuntimeConfig()` *(server & client)* | Returns full config with env overrides applied |
| `setBaseRuntimeConfig()` *(server)* | Register your base config once at startup |
| `createGetRuntimeConfig()` *(server)* | Factory for standalone getters |

