import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { DEFAULT_SETTINGS, PluginSettings } from './types'

export function registerSettings(): void {
  const schema: SettingSchemaDesc[] = [
    {
      key: 'targetPageName',
      type: 'string',
      title: 'Target Page Name',
      description: 'Page where generated previews will be added.',
      default: DEFAULT_SETTINGS.targetPageName,
    },
    {
      key: 'creatorName',
      type: 'string',
      title: 'Creator or Brand Name',
      description: 'Default author shown in generated preview cards.',
      default: DEFAULT_SETTINGS.creatorName,
    },
    {
      key: 'handle',
      type: 'string',
      title: 'Default Handle',
      description: 'Default social handle used in preview cards.',
      default: DEFAULT_SETTINGS.handle,
    },
    {
      key: 'defaultCta',
      type: 'string',
      title: 'Default CTA',
      description: 'Fallback call-to-action text used in templates.',
      default: DEFAULT_SETTINGS.defaultCta,
    },
  ]

  try {
    logseq.useSettingsSchema(schema)
  } catch (error) {
    console.error('[social-preview-studio] Failed to register settings schema:', error)
  }
}

export function getSettings(): PluginSettings {
  try {
    if (logseq.settings) {
      return {
        targetPageName:
          (logseq.settings.targetPageName as string) || DEFAULT_SETTINGS.targetPageName,
        creatorName: (logseq.settings.creatorName as string) || DEFAULT_SETTINGS.creatorName,
        handle: (logseq.settings.handle as string) || DEFAULT_SETTINGS.handle,
        defaultCta: (logseq.settings.defaultCta as string) || DEFAULT_SETTINGS.defaultCta,
      }
    }
  } catch (error) {
    console.error('[social-preview-studio] Failed to read settings:', error)
  }

  return { ...DEFAULT_SETTINGS }
}
