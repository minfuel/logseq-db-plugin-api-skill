# Source Guide: Logseq RDS-81346

This folder contains the plugin logic for creating and managing an RDS 81346 project page inside Logseq.

## What the plugin does

- Creates a dedicated page `RDS/81346 #Project` with standard project properties (`program`, `project_id`)
- Seeds the page with default blocks if it is empty: project id, `#request`, `#event`, `#news` tags, and a TODO checklist
- Opens the page immediately after creation (or navigates to it if it already exists)
- Shows a success message confirming whether the page was newly created or already existed
- Registers a slash command, a command palette entry, and a toolbar button for one-click access

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from:
   - `plugins/logseq-rds-81346/plugin`
3. Access the project page via any of these:
   - Slash command: `RDS 81346: Create or Open`
   - Command palette: `RDS 81346: Create or Open Project`
   - Toolbar button: `RDS81346`

## Developer notes

- Single entry point: `index.ts` (no separate logic/settings modules)
- Page name constant: `PAGE_NAME = 'RDS/81346 #Project'`
- `ensurePageExists` calls `createPage` with `project_id` and `program` properties, returns whether it existed
- `seedIfEmpty` skips seeding if the page already has blocks
- Seed blocks include `project-id::` property and tagged content lines (`#request`, `#event`, `#news`)
