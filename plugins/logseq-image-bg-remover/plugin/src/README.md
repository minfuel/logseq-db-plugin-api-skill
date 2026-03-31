# Source Guide: Logseq Image BG Remover

This folder contains the plugin logic for removing image backgrounds from images found in selected Logseq blocks.

## What the plugin does

- Reads selected blocks (or current block if nothing is multi-selected)
- Finds markdown image links in each block (`![alt](path-or-url)`)
- Loads images from:
  - Local graph paths (for example `../assets/file.png`)
  - Remote URLs (`http://` or `https://`)
  - `data:` / `file://` inputs
- Removes background locally using `@imgly/background-removal`
- Saves processed PNGs into the graph `assets/` folder
- Rewrites block image links to point to the new files

## How to use in Logseq

1. Build the plugin from the `plugin` folder:
   - `npm install`
   - `npm run build`
2. In Logseq, load unpacked plugin from this folder:
   - `plugins/logseq-image-bg-remover/plugin`
3. Select one or more blocks that contain images.
4. Run one of these commands:
   - Slash command: `Image BG Remover: Selected Blocks`
   - Command palette: `Image BG Remover: Selected Blocks`
   - Toolbar button: `BG`

## Developer notes

- Main entry point: `index.ts`
- Core flow function: `removeBackgroundForSelectedBlocks()`
- Output files are generated as `*-nobg-<timestamp>-<id>.png` in `assets/`
- Errors are shown as Logseq warnings and detailed in the dev console
