# Source Guide: Logseq Quick Capture

This folder contains the plugin logic for fast note and TODO capture inside Logseq.

## What the plugin does

- Provides a `/Quick Capture` (and `/qc`) slash command that stamps a capture tag into the current block
- Adds a toolbar button (`📥`) to open the inbox or journal page directly
- Registers a keyboard shortcut (`Ctrl+Shift+I` / `Cmd+Shift+I`) to jump to the capture page
- Target page is configurable: today's journal page or a named inbox page (`Quick Capture`)
- Block format is built by `formatCaptureBlock` and includes an optional `#<captureTag>` suffix

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from:
   - `plugins/logseq-quick-capture/plugin`
3. Capture notes via any of these methods:
   - Type `/Quick Capture` or `/qc` inside any block to insert the capture template
   - Press `Ctrl+Shift+I` (or `Cmd+Shift+I` on Mac) to open the inbox page
   - Click the `📥` toolbar button to navigate directly to the inbox page
4. Configure target page and capture tag in plugin settings

## Developer notes

- Main entry point: `index.ts`
- Pure helpers (no I/O): `logic.ts` (`resolveTargetPage`, `formatCaptureBlock`, `getTodayPageName`)
- Settings schema and accessors: `settings.ts`
- Type definitions: `types.ts`
- `resolveTargetPage` returns today's date string (e.g. `2026-03-31`) when `targetPage === 'journal'`
- `captureInCurrentBlock` updates the block in place; `captureToPage` appends to the target page
