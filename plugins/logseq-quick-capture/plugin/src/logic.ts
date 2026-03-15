// logic.ts — pure helper functions (no I/O or Logseq API calls)

import { getSettings } from './settings'

/** Returns today's date as a Logseq-compatible journal page name (e.g. "2026-03-15"). */
export function getTodayPageName(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Resolves the target page based on plugin settings. */
export function resolveTargetPage(override?: string): string {
  if (override) return override
  const { targetPage, inboxPageName } = getSettings()
  return targetPage === 'journal' ? getTodayPageName() : inboxPageName
}

/** Formats raw content into a Logseq block string, adding the capture tag. */
export function formatCaptureBlock(content: string, isTodo = false): string {
  const { captureTag } = getSettings()
  const prefix = isTodo ? 'TODO ' : ''
  const tag = captureTag ? ` #${captureTag}` : ''
  return `${prefix}${content.trim()}${tag}`
}
