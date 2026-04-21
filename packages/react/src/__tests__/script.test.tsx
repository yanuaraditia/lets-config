import { describe, expect, test } from 'bun:test'
import { render } from '@testing-library/react'
import React from 'react'
import { RuntimeConfigScript } from '../script'

describe('RuntimeConfigScript', () => {
  test('renders a <script> tag', () => {
    const { container } = render(
      React.createElement(RuntimeConfigScript, { config: { public: { apiBase: '/api' } } }),
    )
    const script = container.querySelector('script')
    expect(script).not.toBeNull()
  })

  test('script contains window.__RUNTIME_CONFIG__ assignment', () => {
    const { container } = render(
      React.createElement(RuntimeConfigScript, { config: { public: { key: 'value' } } }),
    )
    expect(container.querySelector('script')?.innerHTML).toContain('window.__RUNTIME_CONFIG__=')
  })

  test('script embeds the public config as JSON', () => {
    const config = { secret: 'hidden', public: { apiBase: '/v2' } }
    const { container } = render(
      React.createElement(RuntimeConfigScript, { config }),
    )
    const html = container.querySelector('script')?.innerHTML ?? ''
    expect(html).toContain('"apiBase":"/v2"')
    expect(html).not.toContain('hidden')
  })

  test('does not include private keys in the script', () => {
    const config = { secretKey: 'do-not-expose', public: { safe: true } }
    const { container } = render(
      React.createElement(RuntimeConfigScript, { config }),
    )
    expect(container.querySelector('script')?.innerHTML).not.toContain('secretKey')
  })

  test('forwards nonce attribute to the <script> tag', () => {
    const { container } = render(
      React.createElement(RuntimeConfigScript, {
        config: { public: {} },
        nonce: 'abc123',
      }),
    )
    expect(container.querySelector('script')?.getAttribute('nonce')).toBe('abc123')
  })
})
