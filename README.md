# @yanuaraditia/config

> Framework-agnostic `useRuntimeConfig` for Vite + React — inspired by Nuxt 3/4.

## Packages

| Package | Version | Downloads | License |
| --- | --- | --- | --- |
| [`@yanuaraditia/config`](./packages/vite) | [![npm](https://img.shields.io/npm/v/%40yanuaraditia%2Fconfig?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@yanuaraditia/config) | [![npm downloads](https://img.shields.io/npm/dm/%40yanuaraditia%2Fconfig?style=flat-square)](https://www.npmjs.com/package/@yanuaraditia/config) | [![license](https://img.shields.io/npm/l/%40yanuaraditia%2Fconfig?style=flat-square)](./LICENSE) |
| [`@yanuaraditia/config-react`](./packages/react) | [![npm](https://img.shields.io/npm/v/%40yanuaraditia%2Fconfig-react?style=flat-square&color=cb3837&logo=npm)](https://www.npmjs.com/package/@yanuaraditia/config-react) | [![npm downloads](https://img.shields.io/npm/dm/%40yanuaraditia%2Fconfig-react?style=flat-square)](https://www.npmjs.com/package/@yanuaraditia/config-react) | [![license](https://img.shields.io/npm/l/%40yanuaraditia%2Fconfig-react?style=flat-square)](./LICENSE) |

---

## Quick Start — SPA (Vite + React)

### 1. Install

```bash
bun add @yanuaraditia/config-react
bun add -D @yanuaraditia/config
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { runtimeConfigPlugin, defineRuntimeConfig } from "@yanuaraditia/config";

export default defineConfig({
  plugins: [
    react(),
    runtimeConfigPlugin({
      config: defineRuntimeConfig({
        // 🌐 Public — available everywhere
        public: {
          apiBase: process.env.VITE_API_BASE ?? "/api",
          appName: "My App",
        },
      }),
      generateTypes: true,
    }),
  ],
});
```

### 3. Wrap your app

```tsx
// main.tsx
import { RuntimeConfigProvider } from "@yanuaraditia/config-react";

createRoot(document.getElementById("root")!).render(
  <RuntimeConfigProvider>
    <App />
  </RuntimeConfigProvider>,
);
```

### 4. Use it anywhere

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
bun add @yanuaraditia/config-react
bun add -D @yanuaraditia/config
```

Add to your `tsconfig.json` for `#runtime-config` types:

```json
{ "compilerOptions": { "types": ["@yanuaraditia/config/virtual"] } }
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { runtimeConfigPlugin, defineRuntimeConfig } from "@yanuaraditia/config";

export default defineConfig({
  plugins: [
    reactRouter(),
    runtimeConfigPlugin({
      config: defineRuntimeConfig({
        // 🔒 Server-only — never reaches the browser
        dbUrl: process.env.DATABASE_URL ?? "",

        // 🌐 Public — available on client and server
        public: {
          apiBase: process.env.API_BASE ?? "/api",
          appVersion: process.env.APP_VERSION ?? "",
        },
      }),
      generateTypes: true,
    }),
  ],
});
```

### 3. Auto-register in `entry.server.tsx`

```ts
// app/entry.server.tsx
import "#runtime-config"; // one line — auto-registers config at server startup

// …rest of your entry.server.tsx
```

### 4. Root layout

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { RuntimeConfigProvider } from "@yanuaraditia/config-react/server";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        <RuntimeConfigProvider>
          <Outlet />
        </RuntimeConfigProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### 5. Use in components and loaders

```tsx
// Any component — only public config accessible here
import { useRuntimeConfig } from "@yanuaraditia/config-react";

export function ApiWidget() {
  const config = useRuntimeConfig();
  return <span>{config.public.appVersion}</span>;
}
```

```ts
// Any loader — use server import for private keys
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
bun add @yanuaraditia/config-react
bun add -D @yanuaraditia/config
```

Add to your `tsconfig.json`:

```json
{ "compilerOptions": { "types": ["@yanuaraditia/config/virtual"] } }
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import { runtimeConfigPlugin, defineRuntimeConfig } from "@yanuaraditia/config";

export default defineConfig({
  plugins: [
    reactRouter(),
    runtimeConfigPlugin({
      config: defineRuntimeConfig({
        // 🔒 Server-only
        shopifyApiKey: process.env.SHOPIFY_API_KEY ?? "",

        // 🌐 Public
        public: {
          appVersion: process.env.APP_VERSION ?? "",
          csPhoneNumber: process.env.CUSTOMER_SUPPORT_PHONE ?? "",
        },
      }),
      generateTypes: true,
    }),
  ],
});
```

### 3. Auto-register in `entry.server.tsx`

```ts
// app/entry.server.tsx
import "#runtime-config"; // one line — auto-registers config at server startup

// …rest of your entry.server.tsx
```

### 4. Root layout

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { RuntimeConfigProvider } from "@yanuaraditia/config-react/server";

export default function App() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <RuntimeConfigProvider>
          <Outlet />
        </RuntimeConfigProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
```

### 5. Use in routes and components

```ts
// app/routes/app._index.tsx
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

export function SupportCard() {
  const config = useRuntimeConfig();
  return <a href={`https://wa.me/${config.public.csPhoneNumber}`}>Contact Support</a>;
}
```

---

## Environment variable overrides

Override any config value at runtime without a rebuild using the `RUNTIME_` prefix convention.

| Env var | Config path |
| --- | --- |
| `RUNTIME_PUBLIC_API_BASE` | `config.public.apiBase` |
| `RUNTIME_PUBLIC_APP_VERSION` | `config.public.appVersion` |
| `RUNTIME_DB_URL` | `config.dbUrl` |
| `RUNTIME_PUBLIC_FEATURE_FLAGS__DARK_MODE` | `config.public.featureFlags.darkMode` |

Rules:

- Prefix: `RUNTIME_` (configurable via `envPrefix` option)
- Public keys: `RUNTIME_PUBLIC_<KEY>`
- Private keys: `RUNTIME_<KEY>`
- camelCase → `_` (e.g. `APP_VERSION` → `appVersion`)
- Nesting → `__` (double underscore)

---

## TypeScript types

With `generateTypes: true`, a `runtime-config.d.ts` is written to your project root automatically. Or declare manually:

```ts
// runtime-config.d.ts
declare module "@yanuaraditia/config" {
  interface PrivateRuntimeConfig {
    dbUrl: string;
    shopifyApiKey: string;
  }
  interface PublicRuntimeConfig {
    apiBase: string;
    appVersion: string;
  }
}
```

---

## License

[MIT](./LICENSE) © Yanuar Aditia

