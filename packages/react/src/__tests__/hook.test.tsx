import { describe, expect, test, beforeEach } from 'bun:test'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { RuntimeConfigProvider } from '../provider'
import { useRuntimeConfig } from '../hook'
import type { AnyRuntimeConfig } from '../context'

const config: AnyRuntimeConfig = { public: { apiBase: '/api', appName: 'TestApp' } }

describe('useRuntimeConfig hook', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__
  })

  test('reads config from RuntimeConfigProvider', () => {
    const { result } = renderHook(() => useRuntimeConfig(), {
      wrapper: ({ children }) =>
        React.createElement(RuntimeConfigProvider, { config }, children),
    })
    expect(result.current).toEqual(config)
  })

  test('falls back to window.__RUNTIME_CONFIG__ when no provider', () => {
    ;(window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__ = config
    const { result } = renderHook(() => useRuntimeConfig())
    expect((result.current as typeof config).public.apiBase).toBe('/api')
  })

  test('returns empty public config when no provider and no window var', () => {
    const { result } = renderHook(() => useRuntimeConfig())
    expect(result.current).toEqual({ public: {} })
  })

  test('closest provider wins over window.__RUNTIME_CONFIG__', () => {
    ;(window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__ = {
      public: { apiBase: '/from-window' },
    }
    const providerConfig: AnyRuntimeConfig = { public: { apiBase: '/from-provider' } }
    const { result } = renderHook(() => useRuntimeConfig(), {
      wrapper: ({ children }) =>
        React.createElement(RuntimeConfigProvider, { config: providerConfig }, children),
    })
    expect((result.current as typeof config).public.apiBase).toBe('/from-provider')
  })
})
