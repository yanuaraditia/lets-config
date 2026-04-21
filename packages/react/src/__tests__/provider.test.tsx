import { describe, expect, test, beforeEach } from 'bun:test'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { RuntimeConfigProvider } from '../provider'
import { useRuntimeConfig } from '../hook'
import type { AnyRuntimeConfig } from '../context'

function Consumer() {
  const config = useRuntimeConfig() as AnyRuntimeConfig & { public: { label?: string } }
  return React.createElement('span', { 'data-testid': 'label' }, config.public.label ?? 'empty')
}

describe('RuntimeConfigProvider', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__
  })

  test('provides config to children via context', () => {
    const config: AnyRuntimeConfig = { public: { label: 'hello' } }
    render(
      React.createElement(RuntimeConfigProvider, { config },
        React.createElement(Consumer),
      ),
    )
    expect(screen.getByTestId('label').textContent).toBe('hello')
  })

  test('without config prop reads from window.__RUNTIME_CONFIG__', () => {
    ;(window as unknown as Record<string, unknown>).__RUNTIME_CONFIG__ = {
      public: { label: 'from-window' },
    }
    render(
      React.createElement(RuntimeConfigProvider, null,
        React.createElement(Consumer),
      ),
    )
    expect(screen.getByTestId('label').textContent).toBe('from-window')
  })

  test('without config prop or window var renders empty fallback', () => {
    render(
      React.createElement(RuntimeConfigProvider, null,
        React.createElement(Consumer),
      ),
    )
    expect(screen.getByTestId('label').textContent).toBe('empty')
  })

  test('nested providers: innermost wins', () => {
    const outer: AnyRuntimeConfig = { public: { label: 'outer' } }
    const inner: AnyRuntimeConfig = { public: { label: 'inner' } }
    render(
      React.createElement(RuntimeConfigProvider, { config: outer },
        React.createElement(RuntimeConfigProvider, { config: inner },
          React.createElement(Consumer),
        ),
      ),
    )
    expect(screen.getByTestId('label').textContent).toBe('inner')
  })
})
