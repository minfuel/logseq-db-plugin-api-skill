# Source Guide: Logseq Master Tools

This folder contains the plugin logic for managing a catalog of tools (plugins, workflows, and drafts) inside Logseq.

## What the plugin does

- Maintains a persistent catalog of tools stored as plugin settings JSON
- Each tool has an id, name, summary, keywords, a target page, and a kind (`plugin` | `workflow` | `draft`)
- Opens a dashboard page listing all registered tools
- Creates a dedicated Logseq page per tool with its description and action hints
- Routes a free-text task description to the best matching tool using keyword scoring
- Prompts the user to draft a new tool if no strong match is found
- Ships with default tools covering common Logseq workflows (Quick Capture, procurement, etc.)

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from:
   - `plugins/logseq-master-tools/plugin`
3. Trigger any of these commands from the command palette:
   - `Master Tools: Open Dashboard` — lists all tools on a dedicated page
   - `Master Tools: Create New Tool` — prompts for a description and drafts a tool page
   - `Master Tools: Route Task` — describe a task; routes to closest match or creates a draft

## Developer notes

- Main entry point: `index.ts`
- Routing / NLP helpers: `logic.ts` (`routeTask`, `buildDraftTool`, `tokenize`)
- Settings and catalog persistence: `settings.ts`
- Type definitions: `types.ts` (`ToolDefinition`, `PluginSettings`, `RouteResult`, `DEFAULT_TOOLS`)
- The tool catalog is stored in `logseq.settings.toolCatalogJson` as a JSON string
- Scoring: each keyword match scores 3 pts, description token match scores 1 pt; threshold is 3
