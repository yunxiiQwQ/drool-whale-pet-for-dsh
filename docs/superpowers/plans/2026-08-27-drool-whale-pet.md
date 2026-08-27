# Drool Whale Pet for DSH Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independently installable DSH plugin that ships the whale desktop companion, task-status bubble, live settings, and quick toggle.

**Architecture:** A Node host entry owns session-state reduction, settings, the local configuration endpoint, and a supervised Python/Qt helper. A browser client entry contributes only the companion settings card and quick toggle. Runtime assets and tests are copied from the verified companion baseline, then every public and persistent identifier is moved to the standalone `drool-whale-pet` namespace.

**Tech Stack:** TypeScript, JavaScript, Cordis, Schemastery, React, Vitest/jsdom, Python 3, PySide6, PyInstaller, tsdown, pnpm.

---

## File map

- `package.json`, `cordis.patch.yml`: DSH package and loader contract.
- `src/index.ts`: host registration, settings, local endpoint, and helper lifecycle.
- `src/host/*.js`: protocol, reducer, status copy, and helper supervision.
- `src/client/index.ts`: browser contribution lifecycle.
- `src/client/companion-settings.ts`: DSH settings card.
- `src/client/quick-toggle.ts`: standalone quick-toggle controller.
- `src/client/companion.module.css`: toggle styling scoped to this plugin.
- `runtime/*.py`: native companion rendering and persistence.
- `assets/pet/*`, `assets/pet-manifest.json`: animation contract and frames.
- `scripts/*.mjs`, `scripts/*.ps1`: generated-asset checks, helper build, and packaged smoke test.
- `tests/companion-*.spec.ts`, `runtime/tests/*.py`: host, client, asset, and runtime regression coverage.
- `README.md`, `README.en.md`, `LICENSE`, `NOTICE`: installation, operation, and attribution.

### Task 1: Scaffold the standalone package

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `cordis.patch.yml`
- Create: `tsdown.config.ts`
- Create: `build/tsdown.client.ts`
- Create: `build/web-platform.ts`
- Create: `tsconfig.vitest.json`
- Create: `vitest.config.ts`
- Create: `biome.json`
- Create: `requirements.txt`
- Create: `tests/package-contract.spec.ts`

- [ ] **Step 1: Copy the verified build/test infrastructure**

Run from `D:\drool whale pet for dsh`:

```powershell
New-Item -ItemType Directory -Force build, tests | Out-Null
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\build\tsdown.client.ts' 'build\tsdown.client.ts'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\build\web-platform.ts' 'build\web-platform.ts'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tsconfig.vitest.json' .
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\vitest.config.ts' .
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\biome.json' .
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\requirements.txt' .
```

Expected: six infrastructure files exist only in the new repository.

- [ ] **Step 2: Write the package contract test first**

Create `tests/package-contract.spec.ts` with assertions that:

```ts
expect(pkg.name).toBe('@dsh-external/dsh-client-plugin-drool-whale-pet')
expect(pkg.exports['./client']).toBe('./lib/client.js')
expect(pkg.files).toContain('runtime/')
expect(patch).toContain('id: drool-whale-pet')
expect(patch).toContain("name: '@dsh-external/dsh-client-plugin-drool-whale-pet'")
```

- [ ] **Step 3: Create the package manifest, install dependencies, and observe the missing-loader failure**

Create `package.json` with the package identity, exports, files list, scripts, peer dependency, and development dependencies specified below, then run `pnpm install` followed by `pnpm exec vitest run tests/package-contract.spec.ts`.

Expected: FAIL because `cordis.patch.yml` has not been created.

- [ ] **Step 4: Create the minimal package and loader manifests**

Use package identity `@dsh-external/dsh-client-plugin-drool-whale-pet`, version `0.1.0`, exports for `.`, `./client`, and `./package.json`, and these scripts:

```json
{
  "build": "tsdown",
  "lint": "biome check .",
  "typecheck": "tsc -p tsconfig.vitest.json --noEmit",
  "test": "vitest run",
  "build:helper:windows": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-helper.ps1",
  "test:helper:packaged": "node scripts/test-packaged-helper.mjs",
  "test:python": "py -3 -m unittest discover -s runtime/tests -t ."
}
```

Set `peerDependencies` to `{"@deepseek-ai/cordis":"^4.0.1"}`. Set `devDependencies` to `@biomejs/biome ^2.5.9`, `@deepseek-ai/cordis ^4.0.1`, `@deepseek-ai/schemastery ^3.18.1`, `@types/node ^26.2.0`, `@types/react ^18.3.0`, `jsdom 29.1.1`, `lightningcss ^1.32.0`, `react ^18.0.0`, `tsdown ^0.22.2`, `typescript ^5.9.3`, and `vitest ^4.1.8`. Set `files` to the two library entries, patch, runtime, pet assets and manifest, helper scripts, READMEs, license, and notice. Set Node to `>=22.19`, CPU to `x64`, package manager to `pnpm@11.21.0`, and license to `BSD-3-Clause`.

Create `.gitignore` with exactly:

```gitignore
node_modules/
lib/
coverage/
*.tgz
runtime/build/
runtime/dist/
__pycache__/
*.pyc
```

Create `cordis.patch.yml` with one `drool-whale-pet` entry and the approved defaults: enabled `true`, scale `0.6552`, bubble scale `0.78`, activity `normal`, reduced motion `false`, bubble mode `always`, bubble states `SUCCESS`, `ERROR`, and `WAITING`, and sub-agents `false`.

Create `tsdown.config.ts`:

```ts
import { clientBundle } from './build/tsdown.client.ts'

export default clientBundle('@dsh-external/dsh-client-plugin-drool-whale-pet', ['src/index.ts'])
```

- [ ] **Step 5: Install dependencies and pass the package contract**

Run: `pnpm exec vitest run tests/package-contract.spec.ts`

Expected: one test file passes.

- [ ] **Step 6: Commit the scaffold**

```powershell
git add .gitignore package.json pnpm-lock.yaml cordis.patch.yml tsdown.config.ts build tsconfig.vitest.json vitest.config.ts biome.json requirements.txt tests/package-contract.spec.ts
git commit -m "chore: scaffold standalone DSH pet plugin"
```

### Task 2: Port and namespace the host bridge

**Files:**
- Create: `src/index.ts`
- Create: `src/host/companion-reducer.js`
- Create: `src/host/helper-process.js`
- Create: `src/host/protocol.js`
- Create: `src/host/status-copy.js`
- Create: `tests/companion-config-endpoint.spec.ts`
- Create: `tests/companion-helper-process.spec.ts`
- Create: `tests/companion-protocol.spec.ts`
- Create: `tests/companion-reducer.spec.ts`
- Create: `tests/companion-status-copy.spec.ts`

- [ ] **Step 1: Copy the host implementation and focused tests**

```powershell
New-Item -ItemType Directory -Force src\host | Out-Null
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\src\index.ts' 'src\index.ts'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\src\host\*' 'src\host\'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-config-endpoint.spec.ts' tests\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-helper-process.spec.ts' tests\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-protocol.spec.ts' tests\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-reducer.spec.ts' tests\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-status-copy.spec.ts' tests\
```

- [ ] **Step 2: Change endpoint assertions before implementation**

Update the config test to assert:

```ts
expect(CONFIG_ENDPOINT).toBe('/plugins/drool-whale-pet/config')
```

Add a source-contract assertion that the settings registration ID is `drool-whale-pet` and the exported package name is `@dsh-external/dsh-client-plugin-drool-whale-pet`.

- [ ] **Step 3: Run the host tests and confirm the namespace failure**

Run: `pnpm exec vitest run tests/companion-config-endpoint.spec.ts tests/companion-helper-process.spec.ts tests/companion-protocol.spec.ts tests/companion-reducer.spec.ts tests/companion-status-copy.spec.ts`

Expected: endpoint and package-identity assertions fail; behavioral tests remain green.

- [ ] **Step 4: Move all host-facing identifiers to the standalone namespace**

Update `src/index.ts` to export the new package name and endpoint, register settings as `drool-whale-pet`, use `drool-whale-pet` log/effect labels, and emit `DSH_DROOL_WHALE_*` environment variables. Update `src/host/helper-process.js` comments and runtime contract names to match. Preserve reducer behavior, restart bounds, loopback checks, origin checks, request-size limit, and allowed-setting validation.

- [ ] **Step 5: Pass the focused host suite**

Run: `pnpm exec vitest run tests/companion-config-endpoint.spec.ts tests/companion-helper-process.spec.ts tests/companion-protocol.spec.ts tests/companion-reducer.spec.ts tests/companion-status-copy.spec.ts`

Expected: all focused host tests pass.

- [ ] **Step 6: Commit the host bridge**

```powershell
git add src\index.ts src\host tests\companion-*.spec.ts
git commit -m "feat: add standalone companion host bridge"
```

### Task 3: Add the settings card and quick toggle

**Files:**
- Create: `src/client/index.ts`
- Create: `src/client/companion-settings.ts`
- Create: `src/client/quick-toggle.ts`
- Create: `src/client/companion.module.css`
- Create: `src/css-modules.d.ts`
- Create: `tests/companion-client-slot.spec.ts`
- Create: `tests/companion-client-toggle.spec.ts`

- [ ] **Step 1: Copy the settings card and CSS typing contract**

```powershell
New-Item -ItemType Directory -Force src\client | Out-Null
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\src\client\companion-settings.ts' 'src\client\companion-settings.ts'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\src\css-modules.d.ts' 'src\css-modules.d.ts'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-client-slot.spec.ts' tests\
```

- [ ] **Step 2: Write the quick-toggle lifecycle test**

Create `tests/companion-client-toggle.spec.ts` that applies the client plugin in jsdom, verifies one button with `aria-label="鲸鱼桌宠开关"`, clicks it, expects a PATCH to `/plugins/drool-whale-pet/config` with `{ enabled: false }`, disposes the Cordis effect, and expects the button to be removed.

- [ ] **Step 3: Run client tests and confirm the missing client entry failure**

Run: `pnpm exec vitest run tests/companion-client-{slot,toggle}.spec.ts`

Expected: FAIL because the standalone client entry and toggle controller do not exist.

- [ ] **Step 4: Implement the minimal standalone browser contribution**

Create `src/client/index.ts`:

```ts
import type { Context } from '@deepseek-ai/cordis'
import { registerCompanionSettingsCard } from './companion-settings.ts'
import { createQuickToggle } from './quick-toggle.ts'

export const inject = ['slots']

export function apply(ctx: Context): void {
  registerCompanionSettingsCard(ctx)
  const toggle = createQuickToggle(document.body)
  ctx.effect(() => () => toggle.dispose(), 'drool-whale-pet: quick toggle')
}
```

`createQuickToggle()` must create one fixed-position, plugin-owned button with a whale glyph, load initial state with GET, persist clicks with PATCH, keep optimistic state if the host is temporarily unreachable, position beside the DSH navigation tree when present, and expose `dispose()` that removes listeners, observers, scheduled frames, and DOM.

Move the settings endpoint, slot key, test ID, and log prefix in `companion-settings.ts` to the `drool-whale-pet` namespace. Scope `companion.module.css` with `[data-drool-whale-pet]` and use DSH color variables with neutral fallbacks.

- [ ] **Step 5: Pass the client tests**

Run: `pnpm exec vitest run tests/companion-client-{slot,toggle}.spec.ts`

Expected: settings registration and toggle lifecycle tests pass.

- [ ] **Step 6: Commit the client contribution**

```powershell
git add src\client src\css-modules.d.ts tests\companion-client-*.spec.ts
git commit -m "feat: add pet settings and quick toggle"
```

### Task 4: Port runtime, assets, and packaged helper

**Files:**
- Create: `runtime/__init__.py`
- Create: `runtime/animation_model.py`
- Create: `runtime/helper.py`
- Create: `runtime/layout_store.py`
- Create: `runtime/tests/*.py`
- Create: `assets/pet/*.png`
- Create: `assets/pet-manifest.json`
- Create: `tests/companion-assets.spec.ts`
- Create: `scripts/build-helper.ps1`
- Create: `scripts/test-packaged-helper.mjs`
- Create: `scripts/normalize-pet-frames.py`

- [ ] **Step 1: Copy the verified runtime, animation contract, assets, and tests**

```powershell
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\runtime' . -Recurse
New-Item -ItemType Directory -Force assets, scripts | Out-Null
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\assets\pet' 'assets\pet' -Recurse
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\assets\pet-manifest.json' 'assets\pet-manifest.json'
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\tests\companion-assets.spec.ts' tests\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\scripts\build-helper.ps1' scripts\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\scripts\test-packaged-helper.mjs' scripts\
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\scripts\normalize-pet-frames.py' scripts\
```

- [ ] **Step 2: Add standalone persistence and environment assertions**

Extend the Python tests to assert `default_layout_path()` ends in `drool-whale-pet/layout.json`. Add a source-contract test asserting `runtime/helper.py` reads `DSH_DROOL_WHALE_SCALE`, `DSH_DROOL_WHALE_BUBBLE_SCALE`, `DSH_DROOL_WHALE_ACTIVITY_LEVEL`, `DSH_DROOL_WHALE_REDUCED_MOTION`, `DSH_DROOL_WHALE_BUBBLE_MODE`, `DSH_DROOL_WHALE_BUBBLE_STATES`, and `DSH_DROOL_WHALE_WEBUI_URL`.

- [ ] **Step 3: Run tests and confirm old persistent/runtime identifiers fail**

Run: `pnpm test -- tests/companion-assets.spec.ts` and `pnpm test:python`

Expected: asset tests pass; new persistence and environment assertions fail.

- [ ] **Step 4: Rebrand runtime contracts without changing rendering behavior**

Update `runtime/layout_store.py`, `runtime/helper.py`, host environment emission, and packaged smoke-test fixtures to use `drool-whale-pet` and `DSH_DROOL_WHALE_*`. Rename the built executable to `drool-whale-pet-helper.exe` in the build script, helper resolver, package files, and smoke test.

- [ ] **Step 5: Build and test the helper**

Run:

```powershell
pnpm test -- tests/companion-assets.spec.ts tests/companion-helper-process.spec.ts
pnpm test:python
pnpm build:helper:windows
pnpm test:helper:packaged
```

Expected: JavaScript asset/helper tests pass, Python tests pass, `runtime/bin/win32-x64/drool-whale-pet-helper.exe` is created, and the packaged smoke test exits successfully.

- [ ] **Step 6: Commit runtime and packaged artifacts**

```powershell
git add runtime assets scripts tests\companion-assets.spec.ts tests\companion-helper-process.spec.ts src\host\helper-process.js src\index.ts package.json
git commit -m "feat: package the drool whale runtime"
```

### Task 5: Add distribution documentation and attribution

**Files:**
- Create: `README.md`
- Create: `README.en.md`
- Create: `LICENSE`
- Create: `NOTICE`

- [ ] **Step 1: Copy legal baselines and inspect every attribution**

```powershell
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\LICENSE' .
Copy-Item 'D:\dsh-maid-whale-webUI\maid-whale-webui\NOTICE' .
```

Expected: BSD-3-Clause project license and the companion/art attribution are present.

- [ ] **Step 2: Write the Chinese and English README files**

Both files must document package name, DSH installation, configuration fields and defaults, helper requirements, Windows x64 support, development commands, build commands, packaged-helper verification, source provenance, and license. The opening describes the standalone pet positively and uses `drool-whale-pet` identifiers throughout.

- [ ] **Step 3: Scan user-facing surfaces for stale identities**

Run:

```powershell
rg -n -i 'maid-whale-webui|ui-skin-maid-whale|cloud-paper|deepseek-workshop|DSH_DAFEIYU|dsh-dafeiyu' README.md README.en.md package.json cordis.patch.yml src runtime scripts tests
```

Expected: no matches except source-provenance wording in `NOTICE` and comments where the upstream project name is required for attribution.

- [ ] **Step 4: Commit documentation**

```powershell
git add README.md README.en.md LICENSE NOTICE
git commit -m "docs: document the standalone whale pet"
```

### Task 6: Full verification and source-repository guard

**Files:**
- Modify only files needed to fix verification failures inside `D:\drool whale pet for dsh`

- [ ] **Step 1: Run static and unit verification**

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm test:python
pnpm build
```

Expected: every command exits zero.

- [ ] **Step 2: Verify distributable contents and packaged helper**

```powershell
pnpm pack --dry-run
pnpm test:helper:packaged
```

Expected: the package includes `lib/index.js`, `lib/client.js`, `cordis.patch.yml`, `runtime/`, `assets/pet/`, manifest, scripts, READMEs, license files, and the Windows helper; the helper smoke test passes.

- [ ] **Step 3: Run a fresh runtime launch check**

Launch the packaged helper with the smoke harness, send HELLO, CONFIG, IDLE, WORKING, SUCCESS, and shutdown messages, and require readiness plus clean exit. Capture only persistent test results; remove transient screenshots, logs, and unpack directories after inspection.

- [ ] **Step 4: Verify both Git repositories**

```powershell
git status --short
git log --oneline --decorate -6
git -C 'D:\dsh-maid-whale-webUI' rev-parse HEAD
git -C 'D:\dsh-maid-whale-webUI' status --porcelain=v1
```

Expected: the new repository is clean; the source repository remains at `a29e23f88a679dd7c15f23fb16a7ca017e52adaa` with empty status output.

- [ ] **Step 5: Commit any verification-only corrections**

If verification required scoped fixes, commit only those fixes:

```powershell
git add --all
git commit -m "test: verify standalone pet distribution"
```

Expected: no uncommitted task-owned changes remain.
