import { defineConfig } from 'tsdown'

export default defineConfig([
  // Client bundle
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', '@runtime-config/core'],
  },
  // Server bundle
  {
    entry: ['src/server.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom', '@runtime-config/core'],
    platform: 'node',
  },
])
