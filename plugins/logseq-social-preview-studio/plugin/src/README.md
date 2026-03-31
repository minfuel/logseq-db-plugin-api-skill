# Source Guide: Logseq Social Preview Studio

This folder contains the plugin logic for creating social media content previews inside Logseq.

## What the plugin does

- Generates structured social media preview blocks for multiple platforms:
  - Instagram Post (1:1), Snapchat Story (9:16), Facebook Feed (1.91:1)
  - YouTube Video (16:9), TikTok Video (9:16), AdSense Banner, Generic
- Writes preview blocks to a configurable target page (`Social Preview Studio` by default)
- Opens a dashboard page listing all supported platforms and their layout hints
- Prompts the user to pick a platform by number or name, then appends a formatted preview block
- Supports per-platform slash commands and command palette entries for direct creation

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from:
   - `plugins/logseq-social-preview-studio/plugin`
3. Configure creator name, handle, and target page in plugin settings
4. Trigger any of these commands:
   - Slash command: `Social Preview Studio: Open Dashboard`
   - Slash command: `Social Preview Studio: New Preview (Choose Platform)` — prompts for platform
   - Slash command: `Social Preview Studio: <Platform Name>` — one entry per platform
   - Command palette: `Social Preview Studio: Open Dashboard`

## Developer notes

- Main entry point: `index.ts`
- Preview block construction: `logic.ts` (`appendPreview`, `buildDashboardBlocks`)
- Settings schema and accessors: `settings.ts`
- Platform definitions and type contracts: `types.ts` (`PLATFORM_TEMPLATES`, `PlatformTemplate`, `PlatformId`)
- `askForPlatformChoice` accepts either a number (1-based index) or a partial platform name as input
- Dashboard is rebuilt on every open; platform pages accumulate appended preview blocks
