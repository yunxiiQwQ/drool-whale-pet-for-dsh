# Drool Whale Pet for DSH

English | [中文](README.md)

## Preview

<p align="center">
  <img src="preview/pet-working.png" width="660" alt="Whale companion showing a DSH task status">
</p>

## Download

For DSH Web UI on Windows 10/11 x64. Fully exit DSH, including its tray process, before installation.

[Download the ZIP](https://github.com/yunxiiQwQ/drool-whale-pet-for-dsh/archive/refs/heads/main.zip), extract it, and open PowerShell in the project directory; or use Git:

```powershell
git clone https://github.com/yunxiiQwQ/drool-whale-pet-for-dsh.git
cd drool-whale-pet-for-dsh
```

Install and start DSH:

```powershell
dsh plugin --profile web add .
dsh --profile web
```

Configure size, bubbles, and motion under **Settings → Plugins → Plugin config → Whale companion**, or use the whale button at the bottom-right of the workspace to toggle it immediately.

To uninstall:

```powershell
dsh plugin --profile web remove @dsh-external/dsh-client-plugin-drool-whale-pet
```

## Actions

| Preview | Action | Trigger |
| --- | --- | --- |
| <img src="assets/pet/01-idle.png" width="72" alt="Idle"> | Idle | DSH has no active session |
| <img src="assets/pet/16-sleeping.png" width="72" alt="Sleeping"> | Sleeping | DSH is disconnected |
| <img src="assets/pet/03-thinking.png" width="72" alt="Thinking"> | Thinking | A task starts or the agent is analysing |
| <img src="assets/pet/06-working.png" width="72" alt="Working"> | Working | The agent edits files or uses a general tool |
| <img src="assets/pet/07-loading.png" width="72" alt="Searching"> | Searching | The agent searches, reads, or opens content |
| <img src="assets/pet/12-uploading.png" width="72" alt="Commanding"> | Commanding | The agent uses a shell, terminal, or PowerShell |
| <img src="assets/pet/14-playing.png" width="72" alt="Testing"> | Testing | The agent runs tests, checks, builds, or linting |
| <img src="assets/pet/18-please.png" width="72" alt="Waiting"> | Waiting | The agent asks a question, requests approval, or is blocked |
| <img src="assets/pet/08-success.png" width="72" alt="Success"> | Success | Briefly shown when a task completes |
| <img src="assets/pet/09-error.png" width="72" alt="Error"> | Error | Shown when a tool or task fails |
| <img src="assets/pet/11-dragging.png" width="72" alt="Dragging"> | Dragging | Hold and move the companion |
| <img src="assets/pet/02-happy.png" width="72" alt="Head pat"> | Head pat | Click the head or double-click the companion |
| <img src="assets/pet/05-surprised.png" width="72" alt="Poke"> | Poke | Click the body area |
| <img src="assets/pet/17-angry.png" width="72" alt="Tail touch"> | Tail touch | Click the tail area |
| <img src="assets/pet/04-confused.png" width="72" alt="Idle action"> | Idle action | Randomly plays surprise, confusion, or eating while idle |

## Notice

- The plugin reacts only to DSH session events. It does not read keys, capture screenshots, or send telemetry.
- Its configuration endpoint accepts local same-origin requests only and opens no additional listening port.
- Project code is licensed under [BSD-3-Clause](LICENSE).
- The companion bridge and Python runtime are based on [QCYTSN/dsh-dafeiyu](https://github.com/QCYTSN/dsh-dafeiyu) (MIT). See [NOTICE](NOTICE) for animation attribution and the complete third-party license.
