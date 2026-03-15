import '@logseq/libs'
import { buildDashboardBlocks, buildDraftTool, buildToolPageBlocks, routeTask } from './logic'
import { getSettings, getToolCatalog, registerSettings, saveToolCatalog } from './settings'
import { ToolDefinition } from './types'

async function ensurePageWithContent(pageName: string, lines: string[]): Promise<void> {
  await logseq.Editor.createPage(pageName, {}, { redirect: false, createFirstBlock: true })

  const tree = await logseq.Editor.getPageBlocksTree(pageName)
  if (Array.isArray(tree)) {
    for (const block of tree) {
      await logseq.Editor.removeBlock(block.uuid)
    }
  }

  await logseq.Editor.insertBatchBlock(pageName, lines.map((content) => ({ content })), {
    sibling: false,
  })
}

async function openDashboard(): Promise<void> {
  const settings = getSettings()
  const tools = getToolCatalog()
  const lines = buildDashboardBlocks(tools, settings.dashboardPageName)

  await ensurePageWithContent(settings.dashboardPageName, lines)
  await logseq.App.pushState('page', { name: settings.dashboardPageName })
}

async function openToolPage(tool: ToolDefinition): Promise<void> {
  const settings = getSettings()
  const lines = buildToolPageBlocks(tool, settings.defaultToolTag)

  await ensurePageWithContent(tool.pageName, lines)
  await logseq.App.pushState('page', { name: tool.pageName })
}

async function createToolFromPrompt(): Promise<void> {
  const task = window.prompt('Describe the new tool you want to create.')?.trim()
  if (!task) return

  const tools = getToolCatalog()
  const draft = buildDraftTool(task)
  const existing = tools.find((tool) => tool.id === draft.id || tool.name === draft.name)

  if (existing) {
    await openToolPage(existing)
    logseq.UI.showMsg(`Tool already exists: ${existing.name}`, 'warning')
    return
  }

  const nextTools = [...tools, draft]
  await saveToolCatalog(nextTools)
  await openToolPage(draft)
  logseq.UI.showMsg(`Created new draft tool: ${draft.name}`, 'success')
}

async function routeTaskFromPrompt(): Promise<void> {
  const task = window.prompt('Describe the task. The plugin will use an existing tool or draft a new one.')?.trim()
  if (!task) return

  const settings = getSettings()
  const tools = getToolCatalog()
  const result = routeTask(task, tools)

  if (result.matchedTool) {
    logseq.UI.showMsg(`${result.matchedTool.name}: ${result.reason}`, 'success')
    if (settings.autoOpenMatchedToolPage) {
      await openToolPage(result.matchedTool)
    }
    return
  }

  const draft = buildDraftTool(task)
  const nextTools = [...tools, draft]
  await saveToolCatalog(nextTools)
  await openToolPage(draft)
  logseq.UI.showMsg(`No strong match found. Drafted ${draft.name}.`, 'warning')
}

function registerCommands(): void {
  logseq.Editor.registerSlashCommand('Master Tools: Open Dashboard', async () => {
    await openDashboard()
  })

  logseq.Editor.registerSlashCommand('Master Tools: Route Task', async () => {
    await routeTaskFromPrompt()
  })

  logseq.Editor.registerSlashCommand('Master Tools: Create Tool', async () => {
    await createToolFromPrompt()
  })

  logseq.App.registerCommandPalette(
    {
      key: 'master-tools-open-dashboard',
      label: 'Master Tools: Open Dashboard',
    },
    async () => {
      await openDashboard()
    }
  )

  logseq.App.registerCommandPalette(
    {
      key: 'master-tools-route-task',
      label: 'Master Tools: Route Task',
    },
    async () => {
      await routeTaskFromPrompt()
    }
  )

  logseq.App.registerCommandPalette(
    {
      key: 'master-tools-create-tool',
      label: 'Master Tools: Create Tool',
    },
    async () => {
      await createToolFromPrompt()
    }
  )

  logseq.App.registerCommandShortcut(
    { binding: 'ctrl+shift+m', mac: 'meta+shift+m' },
    async () => {
      await openDashboard()
    }
  )

  logseq.App.registerUIItem('toolbar', {
    key: 'master-tools-dashboard',
    template: `
      <a class="button" data-on-click="openMasterTools" title="Open Master Tools">🧰</a>
      <a class="button" data-on-click="routeMasterTask" title="Route a Task">🪄</a>
    `,
  })

  logseq.provideModel({
    async openMasterTools() {
      await openDashboard()
    },
    async routeMasterTask() {
      await routeTaskFromPrompt()
    },
  })
}

async function main(): Promise<void> {
  registerSettings()
  registerCommands()
  console.log('[master-tools] Plugin loaded')
}

logseq.ready(main).catch((error) => {
  console.error('[master-tools] Failed to load plugin:', error)
})