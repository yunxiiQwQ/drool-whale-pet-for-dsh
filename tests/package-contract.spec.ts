import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

describe('standalone package contract', () => {
  it('uses the standalone plugin package identity', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))

    expect(pkg.name).toBe('@dsh-external/dsh-client-plugin-drool-whale-pet')
    expect(pkg.exports['./client']).toBe('./lib/client.js')
    expect(pkg.files).not.toContain('runtime/')
    expect(pkg.files).toEqual(
      expect.arrayContaining([
        'runtime/__init__.py',
        'runtime/animation_model.py',
        'runtime/helper.py',
        'runtime/layout_store.py',
        'runtime/bin/win32-x64/drool-whale-pet-helper.exe',
      ]),
    )
  })

  it('publishes canonical GitHub repository metadata and install instructions', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    const repositoryUrl = 'https://github.com/yunxiiQwQ/drool-whale-pet-for-dsh'

    expect(pkg.repository).toEqual({
      type: 'git',
      url: `git+${repositoryUrl}.git`,
    })
    expect(pkg.homepage).toBe(`${repositoryUrl}#readme`)
    expect(pkg.bugs).toEqual({ url: `${repositoryUrl}/issues` })

    for (const path of ['README.md', 'README.en.md']) {
      const readme = readFileSync(resolve(root, path), 'utf8')
      expect(readme).toContain(`git clone ${repositoryUrl}.git`)
      expect(readme).toContain('cd drool-whale-pet-for-dsh')
      expect(readme).toContain('dsh plugin --profile web add .')
    }
  })

  it('registers the standalone loader identity', () => {
    const patchPath = resolve(root, 'cordis.patch.yml')
    expect(existsSync(patchPath)).toBe(true)
    if (!existsSync(patchPath)) return

    const patch = readFileSync(patchPath, 'utf8')
    expect(patch).toContain('id: drool-whale-pet')
    expect(patch).toContain("name: '@dsh-external/dsh-client-plugin-drool-whale-pet'")
  })

  it('keeps helper build intermediates out of version control', () => {
    const ignore = readFileSync(resolve(root, '.gitignore'), 'utf8')
    expect(ignore).toMatch(/^\.build\/$/m)
  })

  it('excludes Python caches and tests from the published package', () => {
    const npmIgnorePath = resolve(root, '.npmignore')
    expect(existsSync(npmIgnorePath)).toBe(true)
    if (!existsSync(npmIgnorePath)) return

    const npmIgnore = readFileSync(npmIgnorePath, 'utf8')
    expect(npmIgnore).toMatch(/^\*\*\/__pycache__\/$/m)
    expect(npmIgnore).toMatch(/^runtime\/tests\/$/m)
  })

  it('ships bilingual usage and complete legal attribution', () => {
    for (const path of ['README.md', 'README.en.md', 'LICENSE', 'NOTICE']) {
      expect(existsSync(resolve(root, path)), `${path} must exist`).toBe(true)
    }
    if (!existsSync(resolve(root, 'README.md'))) return

    expect(readFileSync(resolve(root, 'README.md'), 'utf8')).toContain(
      '@dsh-external/dsh-client-plugin-drool-whale-pet',
    )
    expect(readFileSync(resolve(root, 'README.en.md'), 'utf8')).toContain(
      '@dsh-external/dsh-client-plugin-drool-whale-pet',
    )
    expect(readFileSync(resolve(root, 'NOTICE'), 'utf8')).toContain('Copyright (c) 2026 QCYTSN')
  })

  it('publishes the four-section bilingual README with its runtime preview', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    const previewPath = 'preview/pet-working.png'
    const headings = (path: string) =>
      [...readFileSync(resolve(root, path), 'utf8').matchAll(/^## (.+)$/gm)].map((match) => match[1])

    expect(headings('README.md')).toEqual(['预览', '下载说明', '动作表格', '声明'])
    expect(headings('README.en.md')).toEqual(['Preview', 'Download', 'Actions', 'Notice'])
    expect(existsSync(resolve(root, previewPath))).toBe(true)
    expect(pkg.files).toContain(previewPath)
  })
})
