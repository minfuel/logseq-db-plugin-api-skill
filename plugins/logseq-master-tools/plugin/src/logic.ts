import { RouteResult, ToolDefinition } from './types'

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'for',
  'from',
  'i',
  'if',
  'in',
  'into',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'the',
  'to',
  'want',
  'with',
])

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
}

export function toToolId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function toTitleCase(input: string): string {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function buildToolNameFromTask(task: string): string {
  const words = tokenize(task).slice(0, 4)
  if (words.length === 0) {
    return 'New Tool'
  }

  return `${toTitleCase(words.join(' '))} Tool`
}

export function buildDraftTool(task: string): ToolDefinition {
  const name = buildToolNameFromTask(task)
  const keywords = Array.from(new Set(tokenize(task))).slice(0, 8)

  return {
    id: toToolId(name),
    name,
    summary: task.trim(),
    keywords,
    pageName: name,
    actionHint: 'Review the draft checklist, refine the steps, then convert it into a concrete workflow or plugin.',
    kind: 'draft',
  }
}

function scoreTool(taskTokens: string[], tool: ToolDefinition): number {
  const keywordSet = new Set(tool.keywords.map((keyword) => keyword.toLowerCase()))
  const descriptionTokens = new Set(tokenize(`${tool.name} ${tool.summary}`))

  let score = 0
  for (const token of taskTokens) {
    if (keywordSet.has(token)) {
      score += 3
      continue
    }

    if (descriptionTokens.has(token)) {
      score += 1
    }
  }

  return score
}

export function routeTask(task: string, tools: ToolDefinition[]): RouteResult {
  const taskTokens = tokenize(task)
  if (taskTokens.length === 0) {
    return {
      matchedTool: null,
      score: 0,
      reason: 'No useful keywords were found in the task description.',
    }
  }

  let bestTool: ToolDefinition | null = null
  let bestScore = 0

  for (const tool of tools) {
    const score = scoreTool(taskTokens, tool)
    if (score > bestScore) {
      bestScore = score
      bestTool = tool
    }
  }

  if (!bestTool || bestScore < 3) {
    return {
      matchedTool: null,
      score: bestScore,
      reason: 'No existing tool matched strongly enough, so a draft tool should be created.',
    }
  }

  const overlap = taskTokens.filter((token) => {
    return bestTool?.keywords.some((keyword) => keyword.toLowerCase() === token)
  })

  return {
    matchedTool: bestTool,
    score: bestScore,
    reason:
      overlap.length > 0
        ? `Matched on keywords: ${overlap.join(', ')}`
        : `Matched ${bestTool.name} on summary and name similarity.`,
  }
}

export function buildDashboardBlocks(tools: ToolDefinition[], dashboardPageName: string): string[] {
  const lines: string[] = [
    `# ${dashboardPageName}`,
    'Master index for available tools and workflow drafts.',
    `Updated: ${new Date().toLocaleString()}`,
    '',
    'Use the toolbar button to reopen this page at any time.',
    'Use the slash command "Master Tools: Route Task" when you want the plugin to pick a tool for you.',
    'Use the slash command "Master Tools: Create Tool" when you already know you want a new tool draft.',
  ]

  for (const tool of tools) {
    lines.push('')
    lines.push(`## ${tool.name}`)
    lines.push(`Type: ${tool.kind}`)
    lines.push(`Summary: ${tool.summary}`)
    lines.push(`Keywords: ${tool.keywords.join(', ') || 'none'}`)
    lines.push(`Page: [[${tool.pageName}]]`)
    lines.push(`Next step: ${tool.actionHint}`)
  }

  return lines
}

export function buildToolPageBlocks(tool: ToolDefinition, defaultTag: string): string[] {
  const keywordLine = tool.keywords.length > 0 ? tool.keywords.join(', ') : 'fill in keywords'

  return [
    `# ${tool.name}`,
    `Tags: #${defaultTag}`,
    `Type: ${tool.kind}`,
    `Summary: ${tool.summary}`,
    `Keywords: ${keywordLine}`,
    '',
    '## Intake',
    `Prompt: ${tool.summary}`,
    '',
    '## Decision',
    'When to use: Fill in the trigger conditions for this tool.',
    'When not to use: Fill in the exclusion conditions for this tool.',
    '',
    '## Steps',
    '- Step 1',
    '- Step 2',
    '- Step 3',
    '',
    '## Notes',
    tool.actionHint,
  ]
}