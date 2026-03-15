# logseq-ops-command-center

Runnable Logseq plugin with command palette actions for all requested MCP tools using mock responses.

## Run

1. Open terminal in `plugins/logseq-ops-command-center/plugin`
2. Install deps: `npm install`
3. Build/watch: `npm run dev`
4. In Logseq: load unpacked plugin from `plugins/logseq-ops-command-center/plugin`

## What you get

- `Ops MCP: Open Dashboard`
- `Ops MCP: Run Tool by Name`
- One command palette action per requested tool key, all returning mock output into page `Ops Command Center Results`
