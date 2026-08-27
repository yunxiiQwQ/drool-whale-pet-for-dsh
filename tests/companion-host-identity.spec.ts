import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('standalone companion host identity', () => {
  it('owns a collision-free DSH namespace', () => {
    const entryPath = resolve(root, 'src/index.ts')
    expect(existsSync(entryPath)).toBe(true)
    if (!existsSync(entryPath)) return

    const source = readFileSync(entryPath, 'utf8')
    expect(source).toContain("export const name = '@dsh-external/dsh-client-plugin-drool-whale-pet'")
    expect(source).toContain("export const CONFIG_ENDPOINT = '/plugins/drool-whale-pet/config'")
    expect(source).toContain("ctx.settings?.register?.('drool-whale-pet'")
  })

  it('emits the standalone runtime environment contract', () => {
    const entryPath = resolve(root, 'src/index.ts')
    expect(existsSync(entryPath)).toBe(true)
    if (!existsSync(entryPath)) return

    const source = readFileSync(entryPath, 'utf8')
    for (const name of [
      'DSH_DROOL_WHALE_SCALE',
      'DSH_DROOL_WHALE_BUBBLE_SCALE',
      'DSH_DROOL_WHALE_ACTIVITY_LEVEL',
      'DSH_DROOL_WHALE_REDUCED_MOTION',
      'DSH_DROOL_WHALE_BUBBLE_MODE',
      'DSH_DROOL_WHALE_BUBBLE_STATES',
      'DSH_DROOL_WHALE_WEBUI_URL',
    ]) {
      expect(source).toContain(name)
    }
  })
})
