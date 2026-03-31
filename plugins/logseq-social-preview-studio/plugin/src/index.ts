import '@logseq/libs'
import { appendPreview, buildDashboardBlocks } from './logic'
import { getSettings, registerSettings } from './settings'
import { PLATFORM_TEMPLATES, PlatformId } from './types'

declare const logseq: any

async function refreshDashboard(): Promise<void> {
  const settings = getSettings()
  await logseq.Editor.createPage(settings.targetPageName, {}, { redirect: false })

  const existing = await logseq.Editor.getPageBlocksTree(settings.targetPageName)
  if (Array.isArray(existing)) {
    for (const block of existing) {
      await logseq.Editor.removeBlock(block.uuid)
    }
  }

  const lines = buildDashboardBlocks()
  await logseq.Editor.insertBatchBlock(
    settings.targetPageName,
    lines.map((content) => ({ content })),
    { sibling: false }
  )

  await logseq.App.pushState('page', { name: settings.targetPageName })
}

function askForPlatformChoice(): PlatformId | null {
  const choices = PLATFORM_TEMPLATES.map((platform, index) => `${index + 1}. ${platform.label}`).join('\n')
  const input = window.prompt(`Choose a platform:\n${choices}`)?.trim()
  if (!input) return null

  const byNumber = Number(input)
  if (!Number.isNaN(byNumber)) {
    const selected = PLATFORM_TEMPLATES[byNumber - 1]
    return selected?.id || null
  }

  const normalized = input.toLowerCase()
  const byName = PLATFORM_TEMPLATES.find((platform) =>
    platform.label.toLowerCase().includes(normalized)
  )

  return byName?.id || null
}

async function createPreviewWithPrompt(): Promise<void> {
  const platformId = askForPlatformChoice()
  if (!platformId) {
    logseq.UI.showMsg('No valid platform selected.', 'warning')
    return
  }

  await appendPreview(platformId)
  logseq.UI.showMsg('Preview created.', 'success')
}

function registerCommands(): void {
  logseq.Editor.registerSlashCommand('Social Preview Studio: Open Dashboard', async () => {
    await refreshDashboard()
  })

  logseq.Editor.registerSlashCommand('Social Preview Studio: New Preview (Choose Platform)', async () => {
    await createPreviewWithPrompt()
  })

  for (const platform of PLATFORM_TEMPLATES) {
    logseq.Editor.registerSlashCommand(`Social Preview Studio: ${platform.label}`, async () => {
      await appendPreview(platform.id)
    })
  }

  logseq.App.registerCommandPalette(
    {
      key: 'social-preview-open-dashboard',
      label: 'Social Preview Studio: Open Dashboard',
    },
    async () => {
      await refreshDashboard()
    }
  )

  logseq.App.registerCommandPalette(
    {
      key: 'social-preview-new-preview',
      label: 'Social Preview Studio: New Preview (Choose Platform)',
    },
    async () => {
      await createPreviewWithPrompt()
    }
  )

  logseq.App.registerUIItem('toolbar', {
    key: 'social-preview-studio-open',
    template: '<a class="button" data-on-click="openSocialPreviewStudio" title="Open Social Preview Studio">SPS</a>',
  })

  logseq.provideModel({
    async openSocialPreviewStudio() {
      await refreshDashboard()
    },
  })
}

async function main(): Promise<void> {
  registerSettings()
  registerCommands()
  console.log('[social-preview-studio] Plugin loaded')
}

logseq.ready(main).catch((error: unknown) => {
  console.error('[social-preview-studio] Failed to load plugin:', error)
})
