import '@logseq/libs'
import { DEFAULT_PAGE, TOOL_DEFINITIONS, ToolDefinition } from './types'
import { runMockTool } from './mock'

declare const logseq: any

async function ensurePage(name: string): Promise<void> {
  await logseq.Editor.createPage(name, {}, { redirect: false, createFirstBlock: true })
}

async function writeDashboard(): Promise<void> {
  await ensurePage(DEFAULT_PAGE)
  const tree = await logseq.Editor.getPageBlocksTree(DEFAULT_PAGE)
  if (Array.isArray(tree)) {
    for (const block of tree) {
      await logseq.Editor.removeBlock(block.uuid)
    }
  }

  const lines = [
    `# ${DEFAULT_PAGE}`,
    'Interactive mock console for ERPNext marketplace/inventory workflows.',
    `Updated: ${new Date().toLocaleString()}`,
    '',
    'Use command palette: Ops MCP: Run Tool by Name',
    'Use command palette: Ops MCP: Open Dashboard',
  ]

  for (const tool of TOOL_DEFINITIONS) {
    lines.push('')
    lines.push(`## ${tool.title}`)
    lines.push(`Tool key: ${tool.key}`)
    lines.push(`Summary: ${tool.description}`)
  }

  await logseq.Editor.insertBatchBlock(DEFAULT_PAGE, lines.map((content) => ({ content })), { sibling: false })
}

async function appendResult(tool: ToolDefinition): Promise<void> {
  const result = await runMockTool(tool.key)
  const pageName = `${DEFAULT_PAGE} Results`
  await ensurePage(pageName)

  const output = [
    `## ${tool.title}`,
    `status:: ${result.status}`,
    `request_id:: ${result.request_id}`,
    `timestamp_utc:: ${result.timestamp_utc}`,
    `tool_key:: ${tool.key}`,
    `data:: ${JSON.stringify(result.data)}`,
    `errors:: ${JSON.stringify(result.errors)}`,
  ]

  await logseq.Editor.insertBatchBlock(pageName, output.map((content) => ({ content })), { sibling: true })
  await logseq.App.pushState('page', { name: pageName })
}

async function runToolFromPrompt(): Promise<void> {
  const toolName = window.prompt('Enter tool key (example: post_to_marketplace)')?.trim()
  if (!toolName) return

  const tool = TOOL_DEFINITIONS.find((item) => item.key === toolName)
  if (!tool) {
    logseq.UI.showMsg('Unknown tool key. Open dashboard to copy a key.', 'warning')
    return
  }

  await appendResult(tool)
  logseq.UI.showMsg(`Ran mock tool: ${tool.title}`, 'success')
}

function registerToolCommands(): void {
  for (const tool of TOOL_DEFINITIONS) {
    logseq.App.registerCommandPalette(
      {
        key: `ops-mcp-${tool.key}`,
        label: `Ops MCP: ${tool.title} (Mock)`,
      },
      async () => {
        await appendResult(tool)
      }
    )
  }
}

function registerGlobalCommands(): void {
  logseq.App.registerCommandPalette(
    {
      key: 'ops-mcp-open-dashboard',
      label: 'Ops MCP: Open Dashboard',
    },
    async () => {
      await writeDashboard()
      await logseq.App.pushState('page', { name: DEFAULT_PAGE })
    }
  )

  logseq.App.registerCommandPalette(
    {
      key: 'ops-mcp-run-tool-by-name',
      label: 'Ops MCP: Run Tool by Name',
    },
    async () => {
      await runToolFromPrompt()
    }
  )

  logseq.App.registerUIItem('toolbar', {
    key: 'ops-command-center-open',
    template: `<a class=\"button\" data-on-click=\"openOpsDashboard\" title=\"Open Ops Command Center\">OPS</a>`,
  })

  logseq.provideModel({
    async openOpsDashboard() {
      await writeDashboard()
      await logseq.App.pushState('page', { name: DEFAULT_PAGE })
    },
  })
}

async function main(): Promise<void> {
  registerGlobalCommands()
  registerToolCommands()
  await writeDashboard()
  console.log('[ops-command-center] loaded')
}

logseq.ready(main).catch((error: unknown) => {
  console.error('[ops-command-center] failed to load', error)
})
