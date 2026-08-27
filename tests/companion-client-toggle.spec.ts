// @vitest-environment jsdom
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

afterEach(() => {
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('companion quick toggle', () => {
  it('loads, updates, and disposes the pet enabled state', async () => {
    const modulePath = resolve(root, 'src/client/quick-toggle.ts')
    expect(existsSync(modulePath)).toBe(true)
    if (!existsSync(modulePath)) return

    const requests: Array<{ url: string; init?: RequestInit }> = []
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      requests.push({ url, init })
      const enabled = init?.method !== 'PATCH'
      return new Response(JSON.stringify({ enabled }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const moduleUrl = pathToFileURL(modulePath).href
    const { createQuickToggle } = (await import(
      /* @vite-ignore */ moduleUrl
    )) as typeof import('../src/client/quick-toggle.ts')
    const controller = createQuickToggle(document.body)

    const button = document.querySelector<HTMLButtonElement>('button[aria-label="鲸鱼桌宠开关"]')
    expect(button).not.toBeNull()
    await vi.waitFor(() => expect(button?.getAttribute('aria-pressed')).toBe('true'))

    button?.click()
    await vi.waitFor(() => expect(button?.getAttribute('aria-pressed')).toBe('false'))
    expect(requests.at(-1)?.url).toBe('/plugins/drool-whale-pet/config')
    expect(requests.at(-1)?.init).toMatchObject({
      method: 'PATCH',
      body: JSON.stringify({ enabled: false }),
    })

    controller.dispose()
    expect(document.querySelector('button[aria-label="鲸鱼桌宠开关"]')).toBeNull()
  })
})
