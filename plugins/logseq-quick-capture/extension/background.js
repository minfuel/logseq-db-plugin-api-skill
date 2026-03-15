// background.js — service worker: retries queued notes + syncs bookmarks to Logseq

const RETRY_ALARM = 'qc-retry'
const RETRY_INTERVAL_MINUTES = 1

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(RETRY_ALARM, { periodInMinutes: RETRY_INTERVAL_MINUTES })

  // Context menu for right-click entertainment capture
  chrome.contextMenus.create({
    id: 'track-entertainment',
    title: '🎬 Track as Entertainment',
    contexts: ['selection', 'link', 'image', 'page'],
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId !== 'track-entertainment') return
  const pending = {
    title:    info.selectionText || info.linkText || '',
    url:      info.linkUrl      || info.pageUrl  || '',
    imageUrl: info.srcUrl       || '',
  }
  chrome.storage.local.set({ qc_pending_ent: pending })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === RETRY_ALARM) {
    await tryFlushQueue()
  }
})

async function getSettings() {
  const { qc_settings = {} } = await chrome.storage.local.get('qc_settings')
  return {
    apiPort: qc_settings.apiPort || 12315,
    authToken: qc_settings.authToken || '',
  }
}

async function tryFlushQueue() {
  const { qc_queue = [] } = await chrome.storage.local.get('qc_queue')
  if (qc_queue.length === 0) return

  const { apiPort, authToken } = await getSettings()
  const failed = []

  for (const item of qc_queue) {
    try {
      const blocks = Array.isArray(item.blocks) && item.blocks.length ? item.blocks : [item.content]

      for (const block of blocks) {
        const headers = { 'Content-Type': 'application/json' }
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`

        const response = await fetch(`http://localhost:${apiPort}/api`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            method: 'logseq.Editor.appendBlockInPage',
            args: [item.targetPage, block],
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
      }
    } catch {
      // Logseq is still offline — stop and keep all remaining in queue
      failed.push(item)
      break
    }
  }

  await chrome.storage.local.set({ qc_queue: failed })
}

// ── Bookmark sync ─────────────────────────────────────────────────────────────

async function getWatchedFolders() {
  const { qc_bookmark_folders = [] } = await chrome.storage.local.get('qc_bookmark_folders')
  return qc_bookmark_folders // [{id, name}]
}

async function sendBlock(content, targetPage, port, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`http://localhost:${port}/api`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      method: 'logseq.Editor.appendBlockInPage',
      args: [targetPage, content],
    }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

async function queueNote(content, targetPage) {
  const { qc_queue = [] } = await chrome.storage.local.get('qc_queue')
  qc_queue.push({ content, targetPage, timestamp: new Date().toISOString() })
  await chrome.storage.local.set({ qc_queue })
}

chrome.bookmarks.onCreated.addListener(async (_id, bookmark) => {
  // bookmark.url is undefined for folders — skip those
  if (!bookmark.url) return

  const watchedFolders = await getWatchedFolders()
  const watched = watchedFolders.find(f => f.id === bookmark.parentId)
  if (!watched) return

  const { apiPort, authToken } = await getSettings()
  const targetPage = watched.name
  const title = bookmark.title || bookmark.url
  // Block format: [Title](URL) #bookmark  – also tag with #FolderName
  const folderTag = watched.name.replace(/\s+/g, '-')
  const blockContent = `[${title}](${bookmark.url}) #bookmark #${folderTag}`

  try {
    await sendBlock(blockContent, targetPage, apiPort, authToken)
  } catch {
    await queueNote(blockContent, targetPage)
  }
})
