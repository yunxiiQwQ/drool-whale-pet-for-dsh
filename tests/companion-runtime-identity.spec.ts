import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function source(path: string): string {
  const absolute = resolve(root, path)
  expect(existsSync(absolute), `${path} must exist`).toBe(true)
  return existsSync(absolute) ? readFileSync(absolute, 'utf8') : ''
}

describe('standalone companion runtime identity', () => {
  it('reads only the standalone environment contract', () => {
    const helper = source('runtime/helper.py')
    for (const name of [
      'DSH_DROOL_WHALE_SCALE',
      'DSH_DROOL_WHALE_BUBBLE_SCALE',
      'DSH_DROOL_WHALE_ACTIVITY_LEVEL',
      'DSH_DROOL_WHALE_REDUCED_MOTION',
      'DSH_DROOL_WHALE_BUBBLE_MODE',
      'DSH_DROOL_WHALE_BUBBLE_STATES',
      'DSH_DROOL_WHALE_WEBUI_URL',
    ]) {
      expect(helper).toContain(name)
    }
  })

  it('persists layout under the standalone plugin directory', () => {
    expect(source('runtime/layout_store.py')).toContain('"drool-whale-pet"')
  })

  it('uses one helper executable name across launch, build, and smoke test', () => {
    for (const path of ['src/host/helper-process.js', 'scripts/build-helper.ps1', 'scripts/test-packaged-helper.mjs']) {
      expect(source(path)).toContain('drool-whale-pet-helper.exe')
    }
  })

  it('declares the helper packager required by the build script', () => {
    expect(source('requirements.txt')).toMatch(/^PyInstaller>=6\.16,<7$/m)
  })

  it('reports the concrete Qt import error from packaged visual mode', () => {
    const helper = source('runtime/helper.py')
    expect(helper).toContain('except ImportError as error:')
    expect(helper).toContain('f"PySide6 is required for visual mode: {error}. Run with --headless for protocol tests."')
  })

  it('isolates PyInstaller from unrelated native DLLs on the caller PATH', () => {
    const build = source('scripts/build-helper.ps1')
    expect(build).toContain('$originalPath = $env:Path')
    expect(build).toContain('$env:Path = $safeBuildPath -join')
    expect(build).toContain('$env:Path = $originalPath')
  })
})
