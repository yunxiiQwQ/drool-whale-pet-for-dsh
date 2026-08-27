# Drool Whale Pet for DSH — Design

## Goal

Create a standalone DeepSeek Harness plugin that provides the existing animated whale desktop companion as an independently installable package. The plugin owns its host bridge, native helper, pet assets, settings UI, packaging scripts, tests, and documentation.

Project location: `D:\drool whale pet for dsh`

Package name: `@dsh-external/dsh-client-plugin-drool-whale-pet`

Plugin identity: `drool-whale-pet`

## User experience

Installing and enabling the plugin starts a transparent, always-on-top whale companion with DSH. The companion follows top-level DSH session states and displays the existing status bubble. Users can enable or disable the companion and configure character size, bubble size, activity level, reduced motion, bubble visibility and states, and sub-agent participation.

The plugin provides two configuration surfaces:

- a DSH settings card with all companion controls;
- the existing quick toggle in the DSH navigation area.

Changes apply live. Disabling the companion stops the native helper; re-enabling it starts a fresh helper process.

## Architecture

The project is a single DSH client plugin package with a Node host entry and a browser client entry.

- `src/index.ts` registers the settings schema, observes session events, owns the helper process, and exposes a loopback-only configuration endpoint at `/plugins/drool-whale-pet/config`.
- `src/host/` contains the session-state reducer, wire protocol, helper lifecycle, and status text.
- `src/client/` contains the settings card and quick toggle registration.
- `runtime/` contains the Python/Qt companion implementation and its focused model modules.
- `assets/pet/` and `assets/pet-manifest.json` contain the animation bundle.
- `scripts/` contains Windows helper build and packaged-helper smoke-test tooling.
- `cordis.patch.yml` registers the plugin and seeds its defaults.

All plugin IDs, settings keys, endpoint paths, log prefixes, bundle identifiers, and lifecycle descriptions use the new plugin identity so both packages can be installed without colliding.

## Runtime data flow

1. DSH loads the host entry and registers the plugin settings.
2. When enabled, the host launches the packaged Windows helper, falling back to the Python source helper for development.
3. Session events pass through the reducer and become newline-delimited JSON protocol messages.
4. The helper renders the selected animation and task-status bubble.
5. Settings updates are sent as live configuration messages; lifecycle changes start or stop the helper.
6. The browser settings card and quick toggle read and update settings through the loopback-only endpoint.

## Reliability and safety

- Companion failures remain isolated from the shared DSH session event bus.
- The helper uses bounded restart attempts, readiness and heartbeat checks, and clean shutdown on plugin disposal.
- The HTTP endpoint accepts loopback clients only, checks same-origin requests, limits request size, and rejects unknown fields.
- The project preserves third-party attribution and license notices for the companion implementation and artwork.
- Generated and packaged artifacts are validated against their sources before release.

## Verification

Acceptance requires:

- JavaScript and TypeScript unit tests passing;
- Python runtime tests passing;
- type checking, linting, and production build passing;
- embedded asset and manifest consistency checks passing;
- Windows helper build and packaged-helper smoke test passing;
- a fresh packaged runtime launch confirming the pet, status bubble, live settings, and shutdown behavior;
- Git status confirming the new project contains only intended files;
- Git status and HEAD confirming `D:\dsh-maid-whale-webUI` remains unchanged.

## Deliverables

- an independent Git repository at the requested path;
- installable DSH plugin source and packaged runtime assets;
- Chinese and English usage documentation;
- license and attribution files;
- automated regression tests and build scripts.
