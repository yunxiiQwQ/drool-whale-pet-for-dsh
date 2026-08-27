import type { Context } from '@deepseek-ai/cordis'
import { registerCompanionSettingsCard } from './companion-settings.ts'
import { createQuickToggle } from './quick-toggle.ts'

export const inject = ['slots']

export function apply(ctx: Context): void {
  registerCompanionSettingsCard(ctx)
  const toggle = createQuickToggle(document.body)
  ctx.effect(() => () => toggle.dispose(), 'drool-whale-pet: quick toggle')
}
