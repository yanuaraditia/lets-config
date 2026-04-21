# @yanuaraditia/config

> Framework-agnostic `useRuntimeConfig` for Vite + React — inspired by Nuxt 3/4.

## Packages

| Package | Version | Downloads | License |
| --- | --- | --- | --- |
| [`@yanuaraditia/config`](./packages/core) | [![npm](https://img.shields.io/npm/v/%40yanuaraditia%2Fconfig?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@yanuaraditia/config) | [![npm downloads](https://img.shields.io/npm/dm/%40yanuaraditia%2Fconfig?style=flat-square)](https://www.npmjs.com/package/@yanuaraditia/config) | [![license](https://img.shields.io/npm/l/%40yanuaraditia%2Fconfig?style=flat-square)](./LICENSE) |
| [`@yanuaraditia/config-vite`](./packages/vite) | [![npm](https://img.shields.io/npm/v/%40yanuaraditia%2Fconfig-vite?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@yanuaraditia/config-vite) | [![npm downloads](https://img.shields.io/npm/dm/%40yanuaraditia%2Fconfig-vite?style=flat-square)](https://www.npmjs.com/package/@yanuaraditia/config-vite) | [![license](https://img.shields.io/npm/l/%40yanuaraditia%2Fconfig-vite?style=flat-square)](./LICENSE) |
| [`@yanuaraditia/config-react`](./packages/react) | [![npm](https://img.shields.io/npm/v/%40yanuaraditia%2Fconfig-react?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@yanuaraditia/config-react) | [![npm downloads](https://img.shields.io/npm/dm/%40yanuaraditia%2Fconfig-react?style=flat-square)](https://www.npmjs.com/package/@yanuaraditia/config-react) | [![license](https://img.shields.io/npm/l/%40yanuaraditia%2Fconfig-react?style=flat-square)](./LICENSE) |

---

## Quick Start — SPA (Vite + React)

### 1. Install

```bash
bun add @yanuaraditia/config @yanuaraditia/config-react
bun add -D @yanuaraditia/config-vite jiti
```

### 2. Define your config

```ts
// runtime.config.ts
import { defineRuntimeConfig } from "@yanuaraditia/config";

export default defineRuntimeConfig({
  // 🔒 Server-only — never reaches the browser
  dbUrl: process.env.DATABASE_URL ?? "",

  // 🌐 Public — available on client and server
  public: {
    apiBase: process.env.VITE_API_BASE ?? "/api",
    appName: "My App",
  },
});
```

### 3. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { runtimeConfigPlugin } from "@yanuaraditia/config-vite";

export default defineConfig({
  plugins: [react(), runtimeConfigPlugin({ generateTypes: true })],
});
```

### 4. Wrap your app

```tsx
// main.tsx
import { RuntimeConfigProvider } from "@yanuaraditia/config-react";

createRoot(document.getElementById("root")!).render(
  <RuntimeConfigProvider>
    <App />
  </RuntimeConfigProvider>,
);
```

### 5. Use it anywhere

```tsx
import { useRuntimeConfig } from "@yanuaraditia/config-react";

export function Header() {
  const config = useRuntimeConfig();
  return <h1>{config.public.appName}</h1>;
}
```

---

## React Router v7 (SSR)

### 1. Install

```bash
bun add @yanuaraditia/config @yanuaraditia/config-react
bun add -D @yanuaraditia/config-vite jiti
```

### 2. Register base config (server entry)

```ts
// app/entry.server.tsx
import baseConfig from "~/runtime.config";
import { setBaseRuntimeConfig } from "@yanuaraditia/config-react/server";

setBaseRuntimeConfig(baseConfig);
// …rest of your server entry
```

### 3. Root layout

```tsx
// app/root.tsx — no loader needed for public config
import { Outlet } from "react-router";
import { useRuntimeConfig } from "@yanuaraditia/config-react/server";
import { RuntimeConfigProvider, RuntimeConfigScript } from "@yanuaraditia/config-react";

export default function Root() {
  const config = useRuntimeConfig(); // reads process.env at render time
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <RuntimeConfigScript config={config} />
      </head>
      <body>
        <RuntimeConfigProvider config={config}>
          <Outlet />
        </RuntimeConfigProvider>
      </body>
    </html>
  );
}
```

### 4. Use in components and loaders

```tsx
// Any component — just call useRuntimeConfig(), no loader or prop drilling needed
import { useRuntimeConfig } from "@yanuaraditia/config-react";

export function ApiWidget() {
  const config = useRuntimeConfig();
  return <span>{config.public.appVersion}</span>;
}
```

```ts
// Any loader — use server import for private keys (stays server-side)
import { useRuntimeConfig } from "@yanuaraditia/config-react/server";

export async function loader() {
  const { dbUrl } = useRuntimeConfig(); // private — never sent to browser
}
```
---

## Shopify App (React Router v7)

Works seamlessly with [`@shopify/shopify-app-react-router`](https://www.npmjs.com/package/@shopify/shopify-app-react-router).

### 1. Install

```bash
bun add @yanuaraditia/config @yanuaraditia/config-react
bun add -D @yanuaraditia/config-vite jiti
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { runtimeConfigPlugin } from "@yanuaraditia/config-vite";

export default defineConfig({
  plugins: [
    // …your existing plugins (e.g. shopifyApp())
    runtimeConfigPlugin({ generateTypes: true }),
  ],
});
```

### 3. Define your config

```ts
// app/runtime.config.ts
import { defineRuntimeConfig } from "@yanuaraditia/config";

export default defineRuntimeConfig({
  // 🔒 Server-only
  shopifyApiKey: process.env.SHOPIFY_API_KEY ?? "",

  // 🌐 Public (safe to expose)
  public: {
    appName: "My Shopify App",
    apiBase: "/api",
  },
});
```

### 4. Register config in `entry.server.tsx`

```tsx
// app/entry.server.tsx
import baseConfig from "~/runtime.config";
import { setBaseRuntimeConfig } from "@yanuaraditia/config-react/server";

// Register once at module load time (before any request handlers run)
setBaseRuntimeConfig(baseConfig);

// …rest of your entry.server.tsx (renderToPipeableStream, etc.)
```

### 5. Root layout with Shopify providers

```tsx
// app/root.tsx — no loader needed for public config
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { AppProvider } from "@shopify/polaris";
import { useRuntimeConfig } from "@yanuaraditia/config-react/server";
import { RuntimeConfigProvider, RuntimeConfigScript } from "@yanuaraditia/config-react";

export default function App() {
  const config = useRuntimeConfig(); // reads process.env at render time
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
  );
}
```
### 6. Use in routes and components

```tsx
// app/routes/app._index.tsx
import { useLoaderData } from "react-router";
import { authenticate } from "~/shopify.server";
import { useRuntimeConfig } from "@yanuaraditia/config-react/server";
import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin } = await authenticate.admin(request);
  const { shopifyApiKey } = useRuntimeConfig(); // private — stays on server
  return { shopName: admin.rest.session.shop };
}
```

```tsx
// Any component — only public config accessible here
import { useRuntimeConfig } from "@yanuaraditia/config-react";

export function AppHeader() {
  const config = useRuntimeConfig();
  return <h1>{config.public.appName}</h1>;
}
```

> **Tip**: `RuntimeConfigScript` must be placed **before** `<Scripts />` so that
> `window.__RUNTIME_CONFIG__` is available when React hydrates.

---

## Environment variable overrides

Override any config key at runtime without a rebuild.

| Env var                                   | Config path                           |
| ----------------------------------------- | ------------------------------------- |
| `RUNTIME_PUBLIC_API_BASE`                 | `config.public.apiBase`               |
| `RUNTIME_PUBLIC_APP_NAME`                 | `config.public.appName`               |
| `RUNTIME_DB_URL`                          | `config.dbUrl`                        |
| `RUNTIME_PUBLIC_FEATURE_FLAGS__DARK_MODE` | `config.public.featureFlags.darkMode` |

Rules:

- Prefix: `RUNTIME_` (configurable via `envPrefix` option)
- Public keys: `RUNTIME_PUBLIC_<KEY>`
- Private keys: `RUNTIME_<KEY>`
- camelCase word boundary: `_` (e.g. `API_BASE` → `apiBase`)
- Nesting separator: `__` (double underscore)

---

## TypeScript types

With `generateTypes: true`, the Vite plugin writes a `runtime-config.d.ts` file
next to your config file automatically. You can also declare types manually:

```ts
// src/runtime-config.d.ts
declare module "@yanuaraditia/config" {
  interface PrivateRuntimeConfig {
    dbUrl: string;
  }
  interface PublicRuntimeConfig {
    apiBase: string;
    appName: string;
  }
}
```

---

## Virtual module (advanced SSR)

Import the full config directly in server-side code:

```ts
import config from "virtual:runtime-config";
// config.dbUrl, config.public.apiBase …
```

Add type support:

```json
// tsconfig.json
{ "compilerOptions": { "types": ["@yanuaraditia/config-vite/virtual"] } }
```

---

## License

[MIT](./LICENSE) © Yanuar Aditia
