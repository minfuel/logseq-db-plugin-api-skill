import { getSettings } from './settings'
import { PLATFORM_TEMPLATES, PlatformId, PlatformTemplate } from './types'

function getTemplate(platformId: PlatformId): PlatformTemplate {
  return PLATFORM_TEMPLATES.find((platform) => platform.id === platformId) || PLATFORM_TEMPLATES[0]
}

function formatTimestamp(): string {
  const now = new Date()
  return now.toISOString().replace('T', ' ').slice(0, 16)
}

export function buildDashboardBlocks(): string[] {
  const settings = getSettings()

  return [
    '# Social Preview Studio',
    `Updated:: ${formatTimestamp()}`,
    `Creator:: ${settings.creatorName}`,
    `Handle:: ${settings.handle}`,
    '## Platforms',
    ...PLATFORM_TEMPLATES.map(
      (platform) => `- ${platform.label} | aspect ${platform.aspectRatio} | ${platform.layoutHint}`
    ),
    '## Quick Start',
    '- Run slash command: Social Preview Studio: New Preview (Choose Platform)',
    '- Or run a platform-specific slash command directly',
    '- Edit plugin settings to customize creator, handle, CTA, and target page',
  ]
}

export function buildPreviewBlocks(platformId: PlatformId, brief: string): string[] {
  const settings = getSettings()
  const platform = getTemplate(platformId)
  const cta = platform.ctaDefault || settings.defaultCta

  return [
    `## ${platform.label}`,
    `Created:: ${formatTimestamp()}`,
    `Platform:: ${platform.label}`,
    `Aspect Ratio:: ${platform.aspectRatio}`,
    `Author:: ${settings.creatorName} (${settings.handle})`,
    `Creative Brief:: ${brief}`,
    '### Post Preview',
    `- Hook: ${brief}`,
    `- Primary Text: ${brief} | Value statement | Social proof`,
    `- CTA: ${cta}`,
    `- Visual Direction: ${platform.layoutHint}`,
    '### Checklist',
    '- Verify title length for this platform',
    '- Keep first line strong for feed stop power',
    '- Confirm CTA and landing intent are aligned',
    '- Validate dimensions and safe areas',
  ]
}

export async function appendPreview(platformId: PlatformId): Promise<void> {
  const settings = getSettings()
  const prompt = window.prompt('What should this preview promote?')?.trim()
  if (!prompt) return

  await logseq.Editor.createPage(settings.targetPageName, {}, { redirect: false })
  const previewLines = buildPreviewBlocks(platformId, prompt)

  await logseq.Editor.appendBlockInPage(settings.targetPageName, previewLines[0])

  const tree = await logseq.Editor.getPageBlocksTree(settings.targetPageName)
  if (!Array.isArray(tree) || tree.length === 0) return

  let cursorUuid = tree[tree.length - 1].uuid
  for (let index = 1; index < previewLines.length; index += 1) {
    const inserted = await logseq.Editor.insertBlock(cursorUuid, previewLines[index], {
      sibling: true,
    })
    if (inserted?.uuid) {
      cursorUuid = inserted.uuid
    }
  }

  await logseq.App.pushState('page', { name: settings.targetPageName })
}
