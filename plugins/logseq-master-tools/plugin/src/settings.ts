import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { DEFAULT_SETTINGS, DEFAULT_TOOLS, PluginSettings, ToolDefinition } from './types'

export function registerSettings(): void {
  const schema: SettingSchemaDesc[] = [
    {
      key: 'dashboardPageName',
      type: 'string',
      title: 'Dashboard Page Name',
      description: 'Page opened by the toolbar button and dashboard command.',
      default: DEFAULT_SETTINGS.dashboardPageName,
    },
    {
      key: 'defaultToolTag',
      type: 'string',
      title: 'Default Tool Tag',
      description: 'Tag added to generated tool pages and tool blocks.',
      default: DEFAULT_SETTINGS.defaultToolTag,
    },
    {
      key: 'autoOpenMatchedToolPage',
      type: 'boolean',
      title: 'Open Matched Tool Page Automatically',
      description: 'When task routing finds a good match, navigate to that tool page.',
      default: DEFAULT_SETTINGS.autoOpenMatchedToolPage,
    },
    {
      key: 'toolCatalogJson',
      type: 'string',
      title: 'Tool Catalog JSON',
      description: 'Stored catalog of tools used by the dashboard and task router.',
      default: DEFAULT_SETTINGS.toolCatalogJson,
    },
  ]

  try {
    logseq.useSettingsSchema(schema)
  } catch (error) {
    console.error('[master-tools] Failed to register settings schema:', error)
  }
}

export function getSettings(): PluginSettings {
  try {
    if (logseq.settings) {
      return {
        dashboardPageName:
          (logseq.settings.dashboardPageName as string) || DEFAULT_SETTINGS.dashboardPageName,
        defaultToolTag:
          (logseq.settings.defaultToolTag as string) || DEFAULT_SETTINGS.defaultToolTag,
        toolCatalogJson:
          (logseq.settings.toolCatalogJson as string) || DEFAULT_SETTINGS.toolCatalogJson,
        autoOpenMatchedToolPage:
          (logseq.settings.autoOpenMatchedToolPage as boolean) ??
          DEFAULT_SETTINGS.autoOpenMatchedToolPage,
      }
    }
  } catch (error) {
    console.error('[master-tools] Failed to read settings:', error)
  }

  return { ...DEFAULT_SETTINGS }
}

export function getToolCatalog(): ToolDefinition[] {
  const { toolCatalogJson } = getSettings()

  try {
    const parsed = JSON.parse(toolCatalogJson) as ToolDefinition[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [...DEFAULT_TOOLS]
    }

    return parsed
      .filter((tool) => tool && typeof tool.name === 'string' && typeof tool.summary === 'string')
      .map((tool, index) => ({
        id: tool.id || `tool-${index + 1}`,
        name: tool.name,
        summary: tool.summary,
        keywords: Array.isArray(tool.keywords) ? tool.keywords : [],
        pageName: tool.pageName || tool.name,
        actionHint: tool.actionHint || 'Open this tool page and continue from the checklist.',
        kind: tool.kind || 'workflow',
      }))
  } catch (error) {
    console.error('[master-tools] Invalid tool catalog JSON, using defaults:', error)
    return [...DEFAULT_TOOLS]
  }
}

export async function saveToolCatalog(tools: ToolDefinition[]): Promise<void> {
  const payload = JSON.stringify(tools, null, 2)
  await logseq.updateSettings({ toolCatalogJson: payload })
}