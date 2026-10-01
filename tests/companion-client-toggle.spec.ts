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
  it('serializes rapid clicks and keeps the latest optimistic state', async () => {
    const pending: Array<(response: Response) => void> = []
    const patches: boolean[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        if (init?.method !== 'PATCH') return Promise.resolve(new Response('{"enabled":true}'))
        patches.push(JSON.parse(String(init.body)).enabled)
        return new Promise<Response>((resolve) => pending.push(resolve))
      }),
    )
    const { createQuickToggle } = await import('../src/client/quick-toggle.ts')
    const controller = createQuickToggle(document.body)
    try {
      await new Promise((resolve) => setTimeout(resolve, 0))
      const button = document.querySelector<HTMLButtonElement>('button[aria-label="鲸鱼桌宠开关"]')!
      button.click()
      button.click()
      await vi.waitFor(() => expect(patches).toEqual([false]))
      pending[0](new Response('{"enabled":false}'))
      await vi.waitFor(() => expect(patches).toEqual([false, true]))
      expect(button.getAttribute('aria-pressed')).toBe('true')
      pending[1](new Response('{"enabled":true}'))
      await vi.waitFor(() => expect(button.getAttribute('aria-pressed')).toBe('true'))
    } finally {
      controller.dispose()
    }
  })

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
