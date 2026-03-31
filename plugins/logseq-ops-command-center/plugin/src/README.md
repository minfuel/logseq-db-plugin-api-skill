# Source Guide: Logseq Ops Command Center

This folder contains the plugin logic for an ERPNext marketplace and inventory operations console running inside Logseq.

## What the plugin does

- Provides a dashboard page (`Ops Command Center`) listing all available tool definitions
- Each tool maps to a real ERPNext or marketplace operation (listings, inventory, tax, routes, etc.)
- Runs mock versions of each tool and appends structured results to a results page
- Allows running any tool by its key via a prompt or directly from the command palette
- All tool keys, titles, and descriptions are defined in `types.ts`

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from:
   - `plugins/logseq-ops-command-center/plugin`
3. Trigger commands from the command palette:
   - `Ops MCP: Open Dashboard` — writes the dashboard page with all tool keys
   - `Ops MCP: Run Tool by Name` — prompts for a tool key and runs a mock execution
   - `Ops MCP: <Tool Title> (Mock)` — one palette entry per tool for direct invocation

## Developer notes

- Main entry point: `index.ts`
- Mock tool execution: `mock.ts` (`runMockTool`)
- Type definitions and tool catalog: `types.ts` (`TOOL_DEFINITIONS`, `DEFAULT_PAGE`, `ToolDefinition`, `MockResult`)
- Results are written as structured property blocks (`status::`, `request_id::`, `data::`, etc.) to `Ops Command Center Results`
- Mock results simulate realistic payloads; replace `runMockTool` with live API calls to go to production
