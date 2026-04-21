# runtime-config

> Framework-agnostic `useRuntimeConfig` for Vite + React — inspired by Nuxt 3/4.

## Packages

| Package | Description |
|---|---|
| [`lets-config`](./packages/core) | Types, `defineRuntimeConfig`, env-var overrides |
| [`@lets-config/vite`](./packages/vite) | Vite plugin — HTML injection, virtual modules, HMR |
| [`@lets-config/react`](./packages/react) | `useRuntimeConfig` hook, `RuntimeConfigProvider`, SSR utilities |

---

## Quick Start — SPA (Vite + React)

### 1. Install

```bash
bun add lets-config @lets-config/react
bun add -D @lets-config/vite jiti
```

### 2. Define your config

```ts
// runtime.config.ts
import { defineRuntimeConfig } from 'lets-config'

export default defineRuntimeConfig({
  // 🔒 Server-only — never reaches the browser
  dbUrl: process.env.DATABASE_URL ?? '',

  // 🌐 Public — available on client and server
  public: {
    apiBase: process.env.VITE_API_BASE ?? '/api',
    appName: 'My App',
  },
})
```

### 3. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { runtimeConfigPlugin } from '@lets-config/vite'

export default defineConfig({
  plugins: [
    react(),
    runtimeConfigPlugin({ generateTypes: true }),
  ],
})
```

### 4. Wrap your app

```tsx
// main.tsx
import { RuntimeConfigProvider } from '@lets-config/react'

createRoot(document.getElementById('root')!).render(
  <RuntimeConfigProvider>
    <App />
  </RuntimeConfigProvider>
)
```

### 5. Use it anywhere

```tsx
import { useRuntimeConfig } from '@lets-config/react'

export function Header() {
  const config = useRuntimeConfig()
  return <h1>{config.public.appName}</h1>
}
```

---

## React Router v7 (SSR)

### 1. Install

```bash
bun add lets-config @lets-config/react
bun add -D @lets-config/vite jiti
```

### 2. Register base config (server entry)

```ts
// app/entry.server.tsx
import baseConfig from '~/runtime.config'
import { setBaseRuntimeConfig } from '@lets-config/react/server'

setBaseRuntimeConfig(baseConfig)
// …rest of your server entry
```

### 3. Root layout

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
        <meta charSet="utf-8" />
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

### 4. Use in components and loaders

```tsx
// Any component
import { useRuntimeConfig } from '@lets-config/react'

export function ApiWidget() {
  const config = useRuntimeConfig()
  return <span>API: {config.public.apiBase}</span>
}
```

```ts
// Any loader (server-side)
import { getRuntimeConfig } from '@lets-config/react/server'

export async function loader() {
  const { dbUrl } = getRuntimeConfig()
  // dbUrl is only available server-side
}
```

---

## Environment variable overrides

Override any config key at runtime without a rebuild.

| Env var | Config path |
|---|---|
| `RUNTIME_PUBLIC_API_BASE` | `config.public.apiBase` |
| `RUNTIME_PUBLIC_APP_NAME` | `config.public.appName` |
| `RUNTIME_DB_URL` | `config.dbUrl` |
| `RUNTIME_PUBLIC_FEATURE_FLAGS__DARK_MODE` | `config.public.featureFlags.darkMode` |

Rules:
- Prefix: `RUNTIME_` (configurable via `envPrefix` option)
- Public keys: `RUNTIME_PUBLIC_<KEY>`
- Private keys: `RUNTIME_<KEY>`
- camelCase word boundary: `_`  (e.g. `API_BASE` → `apiBase`)
- Nesting separator: `__` (double underscore)

---

## TypeScript types

With `generateTypes: true`, the Vite plugin writes a `runtime-config.d.ts` file
next to your config file automatically. You can also declare types manually:

```ts
// src/runtime-config.d.ts
declare module 'lets-config' {
  interface PrivateRuntimeConfig {
    dbUrl: string
  }
  interface PublicRuntimeConfig {
    apiBase: string
    appName: string
  }
}
```

---

## Virtual module (advanced SSR)

Import the full config directly in server-side code:

```ts
import config from 'virtual:runtime-config'
// config.dbUrl, config.public.apiBase …
```

Add type support:
```json
// tsconfig.json
{ "compilerOptions": { "types": ["@lets-config/vite/virtual"] } }
```

---

## License

MIT
