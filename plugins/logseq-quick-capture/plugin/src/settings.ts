// settings.ts — settings schema registration and accessors

import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { DEFAULT_SETTINGS, PluginSettings } from './types'

export function registerSettings(): void {
  const schema: SettingSchemaDesc[] = [
    {
      key: 'captureTag',
      type: 'string',
      title: 'Capture Tag',
      description: 'Tag added to every quick-captured note (no # prefix)',
      default: DEFAULT_SETTINGS.captureTag,
    },
    {
      key: 'targetPage',
      type: 'enum',
      title: 'Default Capture Target',
      description: 'Where captured notes land when using the slash command or toolbar button',
      enumChoices: ['journal', 'inbox'],
      enumPicker: 'radio',
      default: DEFAULT_SETTINGS.targetPage,
    },
    {
      key: 'inboxPageName',
      type: 'string',
      title: 'Inbox Page Name',
      description: 'Page name used when target is set to "inbox"',
      default: DEFAULT_SETTINGS.inboxPageName,
    },
  ]

  try {
    logseq.useSettingsSchema(schema)
  } catch (err) {
    console.error('[quick-capture] Failed to register settings schema:', err)
  }
}

export function getSettings(): PluginSettings {
  try {
    if (logseq.settings) {
      return {
        captureTag:
          (logseq.settings.captureTag as string) || DEFAULT_SETTINGS.captureTag,
        targetPage:
          ((logseq.settings.targetPage as string) as PluginSettings['targetPage']) ||
          DEFAULT_SETTINGS.targetPage,
        inboxPageName:
          (logseq.settings.inboxPageName as string) || DEFAULT_SETTINGS.inboxPageName,
      }
    }
  } catch (err) {
    console.error('[quick-capture] Failed to read settings:', err)
  }
  return { ...DEFAULT_SETTINGS }
}
