# Logseq Quick Capture

Save notes and reminders to Logseq from any browser tab. Notes land in your Logseq graph the moment you save them — or as soon as Logseq is opened if it was offline.

---

## How it works

```
[Chrome Extension popup]
        │  HTTP POST
        ▼
[Logseq HTTP API :12315]  ──▶  block appended to your page
        │
        │ (offline fallback)
        ▼
[chrome.storage queue]  ──▶  auto-retried every minute
```

The **Chrome extension** handles capture from the browser. The optional **Logseq plugin** adds:
- `/Quick Capture` and `/qc` slash commands inside Logseq
- A toolbar inbox button (📥) and `Ctrl+Shift+I` shortcut
- Settings for capture tag and target page

---

## Setup

### 1 — Enable Logseq's built-in HTTP API server

1. Open Logseq Desktop
2. Go to **Settings → Advanced**
3. Enable **"HTTP APIs server"**
4. Note the **auth token** (copy it — you'll need it in step 3)

> The server runs on `http://localhost:12315` by default.

### 2 — Install the Chrome extension

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder in this directory

### 3 — Configure the extension

1. Click the extension icon to open the popup
2. Click ⚙️ and fill in:
   - **Port**: `12315` (default)
   - **Auth Token**: paste the token from Logseq Settings
   - **Target Page**: the Logseq page to save to  
     - Use `Inbox` (or any page name) to collect notes in one place  
     - Use `journal` to send to **today's journal** (`YYYY-MM-DD` format)
   - **Default Tags**: comma-separated tags added to every note (e.g. `QuickCapture`)
3. Click **Save Settings**

### 4 — (Optional) Install the Logseq companion plugin

```bash
cd plugin
npm install
npm run build
```

Then load the `plugin/` folder via Logseq → **Plugins → Load unpacked plugin**.

---

## Usage

### Chrome extension

| Action | How |
|---|---|
| Save a note | Open popup, type, click **Send to Logseq** |
| Mark as TODO | Tick the **Mark as TODO** checkbox |
| Add extra tags | Fill the **Tags** field (comma-separated) |
| Send with keyboard | `Ctrl+Enter` / `⌘+Enter` in the text area |
| Check offline queue | Orange banner shows count + **Sync now** link |

### While Logseq is offline

Notes are saved locally in the extension's storage. The background service worker checks every minute and flushes the queue automatically once Logseq is running.

### Logseq companion plugin

| Action | How |
|---|---|
| Capture inside Logseq | Type `/qc` or `/Quick Capture` in any block |
| Open inbox page | Click 📥 in the toolbar or press `Ctrl+Shift+I` / `⌘+Shift+I` |
| Change capture settings | Logseq → **Plugins → Quick Capture → Settings** |

---

## Project structure

```
logseq-quick-capture/
├── extension/          ← Chrome extension (Manifest V3)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js        ← UI logic + HTTP API calls
│   └── background.js   ← Service worker: offline queue retry
│
└── plugin/             ← Logseq companion plugin (optional)
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── src/
        ├── index.ts    ← Entry point, slash commands, toolbar
        ├── logic.ts    ← Pure helpers (date formatting, block formatting)
        ├── settings.ts ← Settings schema + accessors
        └── types.ts    ← Shared types and defaults
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "Failed to fetch" / notes go to queue | Check Logseq HTTP server is enabled and port matches |
| 401 Unauthorized | Paste the correct auth token from Logseq Settings → Advanced |
| Notes appear on wrong page | Check **Target Page** in extension settings |
| Journal page not found | Set target to `journal`; Logseq must have an existing graph open |
| Slash command not working | Make sure the plugin is loaded and built (`npm run build`) |
