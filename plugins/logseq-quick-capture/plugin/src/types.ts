// types.ts — shared types and defaults for logseq-quick-capture plugin

export interface PluginSettings {
  captureTag: string
  targetPage: 'journal' | 'inbox'
  inboxPageName: string
}

export const DEFAULT_SETTINGS: PluginSettings = {
  captureTag: 'QuickCapture',
  targetPage: 'inbox',
  inboxPageName: 'Inbox',
}

export interface QueuedNote {
  content: string
  targetPage: string
  timestamp: string
}
