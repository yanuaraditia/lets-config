import { defineConfig } from 'tsdown'

export default defineConfig([
  // Client bundle
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    deps: { neverBundle: ['react', 'react-dom', '0config'] },
  },
  // Server bundle
  {
    entry: ['src/server.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    deps: { neverBundle: ['react', 'react-dom', '0config'] },
    platform: 'node',
  },
])
