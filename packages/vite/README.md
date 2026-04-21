# `@0config/vite`

Vite plugin for `@runtime-config`.

## Features

- Reads your `runtime.config.ts` file (TypeScript via **jiti**)
- **SPA mode**: injects `window.__RUNTIME_CONFIG__` into `index.html`
- **SSR mode**: exposes `virtual:runtime-config` for server imports
- Applies env-var overrides at dev-server startup / build time
- HMR — reloads when your config file changes
- Optional TypeScript type generation

## Setup

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { runtimeConfigPlugin } from '@0config/vite'

export default defineConfig({
  plugins: [
    react(),
    runtimeConfigPlugin({
      configFile: './runtime.config.ts', // default
      envPrefix: 'RUNTIME_',            // default
      generateTypes: true,              // writes runtime-config.d.ts next to your config file
    }),
  ],
})
```

```ts
// runtime.config.ts
import { defineRuntimeConfig } from '0config'

export default defineRuntimeConfig({
  // Server-only (never sent to the browser)
  dbUrl: process.env.DATABASE_URL ?? '',

  public: {
    apiBase: process.env.VITE_API_BASE ?? '/api',
    appName: 'My App',
  },
})
```

## Virtual module (SSR)

```ts
// In a React Router v7 root loader or server entry
import config from 'virtual:runtime-config'
// config.dbUrl, config.public.apiBase …
```

Add to `tsconfig.json`:
```json
{ "compilerOptions": { "types": ["@0config/vite/virtual"] } }
```
or set `generateTypes: true` to auto-generate the declarations.
