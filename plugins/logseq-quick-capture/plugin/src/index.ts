// index.ts — plugin entry point for logseq-quick-capture

import '@logseq/libs'
import { registerSettings } from './settings'
import { resolveTargetPage, formatCaptureBlock } from './logic'

// ── Core capture action ───────────────────────────────────────────────────────

/**
 * Inserts the capture template into the currently focused block.
 * The slash command lands the cursor inside an existing block, so we
 * update it rather than inserting a sibling.
 */
async function captureInCurrentBlock(): Promise<void> {
  const { captureTag } = (await import('./settings')).getSettings()
  const block = await logseq.Editor.getCurrentBlock()
  if (!block) return
  // Replace the "/Quick Capture" text the user just typed with the template
  await logseq.Editor.updateBlock(block.uuid, `#${captureTag} `)
}

/**
 * Directly appends a new block to the capture page (used from the toolbar
 * shortcut or keyboard shortcut when there is no current editing context).
 */
async function captureToPage(content: string, isTodo = false): Promise<void> {
  const targetPage = resolveTargetPage()
  const blockContent = formatCaptureBlock(content, isTodo)

  // Ensure the page exists (createPage is a no-op when the page already exists)
  await logseq.Editor.createPage(targetPage, {}, { redirect: false })
  await logseq.Editor.appendBlockInPage(targetPage, blockContent)
}

// ── Plugin bootstrap ──────────────────────────────────────────────────────────

function main(): void {
  registerSettings()

  // ── Slash command: type /qc inside any block ────────────────────────────
  logseq.Editor.registerSlashCommand('Quick Capture', async () => {
    await captureInCurrentBlock()
  })

  // Short alias
  logseq.Editor.registerSlashCommand('qc', async () => {
    await captureInCurrentBlock()
  })

  // ── Toolbar button: open the capture / inbox page ───────────────────────
  logseq.App.registerUIItem('toolbar', {
    key: 'quick-capture-inbox',
    template: `<a class="button" data-on-click="openInbox" title="Open Quick Capture Inbox">📥</a>`,
  })

  // ── Model handlers (called from template data-on-click) ─────────────────
  logseq.provideModel({
    async openInbox() {
      const page = resolveTargetPage()
      await logseq.App.pushState('page', { name: page })
    },
  })

  // ── Keyboard shortcut: Ctrl/Cmd+Shift+I → open inbox ───────────────────
  logseq.App.registerCommandShortcut(
    { binding: 'ctrl+shift+i', mac: 'meta+shift+i' },
    async () => {
      const page = resolveTargetPage()
      await logseq.App.pushState('page', { name: page })
    }
  )

  console.log('[quick-capture] Plugin loaded ✓')
}

logseq.ready(main).catch(console.error)
