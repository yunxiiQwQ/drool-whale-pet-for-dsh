import css from './companion.module.css'

const CONFIG_ENDPOINT = '/plugins/drool-whale-pet/config'

export interface QuickToggleController {
  dispose: () => void
}

export function createQuickToggle(root: HTMLElement): QuickToggleController {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = css.quickToggle ?? ''
  button.dataset.droolWhalePet = 'toggle'
  button.setAttribute('aria-label', '鲸鱼桌宠开关')

  const icon = document.createElement('span')
  icon.className = css.quickToggleIcon ?? ''
  icon.textContent = '🐳'
  icon.setAttribute('aria-hidden', 'true')
  button.append(icon)

  let enabled = true
  let disposed = false
  let positionFrame: number | undefined

  const sync = (): void => {
    button.dataset.petOn = enabled ? 'on' : 'off'
    button.setAttribute('aria-pressed', String(enabled))
    button.title = enabled ? '鲸鱼桌宠：开（点击关闭）' : '鲸鱼桌宠：关（点击开启）'
  }

  const position = (): void => {
    positionFrame = undefined
    const tree = root.querySelector<HTMLElement>('[role="tree"]')
    const bounds = tree?.getBoundingClientRect()
    if (bounds && bounds.width > 0 && bounds.height > 0) {
      button.style.left = `${Math.round(bounds.right - 54)}px`
      button.style.right = 'auto'
      return
    }
    button.style.removeProperty('left')
    button.style.removeProperty('right')
  }

  const schedulePosition = (): void => {
    if (positionFrame !== undefined) return
    positionFrame = window.requestAnimationFrame(position)
  }

  const writeEnabled = async (next: boolean): Promise<void> => {
    enabled = next
    sync()
    try {
      const response = await fetch(CONFIG_ENDPOINT, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ enabled: next }),
      })
      if (!response.ok) return
      const config = (await response.json()) as { enabled?: boolean }
      enabled = config.enabled !== false
      if (!disposed) sync()
    } catch {
      // Keep the optimistic state. A later click retries the host endpoint.
    }
  }

  const onClick = (): void => {
    void writeEnabled(!enabled)
  }
  button.addEventListener('click', onClick)
  root.append(button)
  sync()
  schedulePosition()

  const observer = new MutationObserver(schedulePosition)
  observer.observe(root, { childList: true, subtree: true })
  window.addEventListener('resize', schedulePosition)

  void fetch(CONFIG_ENDPOINT, { cache: 'no-store' })
    .then(async (response) => {
      if (!response.ok) return
      const config = (await response.json()) as { enabled?: boolean }
      enabled = config.enabled !== false
      if (!disposed) sync()
    })
    .catch(() => {})

  return {
    dispose: () => {
      if (disposed) return
      disposed = true
      observer.disconnect()
      window.removeEventListener('resize', schedulePosition)
      if (positionFrame !== undefined) window.cancelAnimationFrame(positionFrame)
      button.removeEventListener('click', onClick)
      button.remove()
    },
  }
}
