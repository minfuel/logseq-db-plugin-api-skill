import '@logseq/libs'

declare const logseq: any

type BlockEntity = {
  uuid: string
  content?: string
}

type NodeDeps = {
  fs: {
    mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>
    readFile: (path: string) => Promise<Uint8Array>
    writeFile: (path: string, data: Uint8Array) => Promise<void>
  }
  path: {
    join: (...parts: string[]) => string
    resolve: (...parts: string[]) => string
    basename: (path: string, suffix?: string) => string
    extname: (path: string) => string
  }
}

type RemoveBackgroundFn = (image: Blob | string | URL | ArrayBuffer | Uint8Array) => Promise<Blob>

let removeBackgroundFn: RemoveBackgroundFn | null = null

async function getRemoveBackground(): Promise<RemoveBackgroundFn> {
  if (removeBackgroundFn) return removeBackgroundFn
  const module = await import('@imgly/background-removal')
  removeBackgroundFn = module.removeBackground as RemoveBackgroundFn
  return removeBackgroundFn
}

function getNodeDeps(): NodeDeps {
  const req = (window as any).require
  if (!req) {
    throw new Error('Node integration is unavailable in this Logseq runtime.')
  }

  return {
    fs: req('fs/promises'),
    path: req('path'),
  }
}

function sanitizeName(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'image'
}

function extractImageLinks(content: string): Array<{ full: string; url: string }> {
  const imagePattern = /!\[[^\]]*\]\(([^)\n]+)\)/g
  const links: Array<{ full: string; url: string }> = []

  for (const match of content.matchAll(imagePattern)) {
    const full = match[0]
    const raw = match[1]?.trim() || ''

    if (!raw) continue

    let url = raw
    if (url.startsWith('<') && url.endsWith('>')) {
      url = url.slice(1, -1)
    }

    const splitIndex = url.search(/\s/)
    if (splitIndex > 0) {
      url = url.slice(0, splitIndex)
    }

    if (!url) continue
    links.push({ full, url })
  }

  return links
}

function replaceFirst(source: string, search: string, replacement: string): string {
  const index = source.indexOf(search)
  if (index === -1) return source
  return source.slice(0, index) + replacement + source.slice(index + search.length)
}

async function resolveImageBlob(src: string, graphPath: string, deps: NodeDeps): Promise<Blob> {
  const normalized = src.trim()

  if (/^https?:\/\//i.test(normalized) || /^data:/i.test(normalized) || /^file:\/\//i.test(normalized)) {
    const response = await fetch(normalized)
    if (!response.ok) {
      throw new Error(`Could not fetch image URL (${response.status})`)
    }
    return await response.blob()
  }

  const localPath = normalized
    .replace(/^\.\//, '')
    .replace(/^\.\.\//, '')

  const absolutePath = normalized.startsWith('/')
    ? normalized
    : deps.path.resolve(graphPath, localPath)

  const bytes = await deps.fs.readFile(absolutePath)
  const safeBytes = Uint8Array.from(bytes)
  return new Blob([safeBytes])
}

async function saveOutputAsset(blob: Blob, sourceUrl: string, graphPath: string, deps: NodeDeps): Promise<string> {
  const assetsDir = deps.path.join(graphPath, 'assets')
  await deps.fs.mkdir(assetsDir, { recursive: true })

  const decodedSource = decodeURIComponent(sourceUrl.split('?')[0])
  const sourceBase = deps.path.basename(decodedSource)
  const sourceExt = deps.path.extname(sourceBase)
  const sourceName = sourceExt ? sourceBase.slice(0, -sourceExt.length) : sourceBase
  const cleaned = sanitizeName(sourceName)
  const fileName = `${cleaned}-nobg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
  const outputPath = deps.path.join(assetsDir, fileName)

  const data = new Uint8Array(await blob.arrayBuffer())
  await deps.fs.writeFile(outputPath, data)

  return `../assets/${fileName}`
}

async function removeBackgroundForSelectedBlocks(): Promise<void> {
  const selected = (await logseq.Editor.getSelectedBlocks?.()) as BlockEntity[] | null
  const current = (await logseq.Editor.getCurrentBlock?.()) as BlockEntity | null
  const blocks = selected?.length ? selected : current ? [current] : []

  if (!blocks.length) {
    logseq.UI.showMsg('Select one or more blocks first.', 'warning')
    return
  }

  const graph = await logseq.App.getCurrentGraph?.()
  const graphPath = graph?.path as string | undefined
  if (!graphPath) {
    logseq.UI.showMsg('Could not resolve the current graph path.', 'error')
    return
  }

  const deps = getNodeDeps()
  const removeBackground = await getRemoveBackground()

  let changedBlocks = 0
  let changedImages = 0
  const errors: string[] = []

  logseq.UI.showMsg('Removing image backgrounds... this can take some time.', 'success')

  for (const block of blocks) {
    const content = block.content || ''
    if (!content.includes('![')) continue

    const links = extractImageLinks(content)
    if (!links.length) continue

    let nextContent = content
    let blockChanged = false

    for (const link of links) {
      try {
        const inputBlob = await resolveImageBlob(link.url, graphPath, deps)
        const removed = await removeBackground(inputBlob)
        const outputBlob = removed instanceof Blob ? removed : new Blob([removed], { type: 'image/png' })
        const outputLink = await saveOutputAsset(outputBlob, link.url, graphPath, deps)

        const updatedImage = link.full.replace(link.url, outputLink)
        nextContent = replaceFirst(nextContent, link.full, updatedImage)
        blockChanged = true
        changedImages += 1
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        errors.push(`${block.uuid.slice(0, 8)}: ${message}`)
      }
    }

    if (blockChanged && nextContent !== content) {
      await logseq.Editor.updateBlock(block.uuid, nextContent)
      changedBlocks += 1
    }
  }

  if (changedImages > 0) {
    logseq.UI.showMsg(`Done. Updated ${changedImages} image(s) in ${changedBlocks} block(s).`, 'success')
  } else {
    logseq.UI.showMsg('No images were updated.', 'warning')
  }

  if (errors.length) {
    console.error('[image-bg-remover] Some images failed:', errors)
    logseq.UI.showMsg(`Some images failed (${errors.length}). See console for details.`, 'warning')
  }
}

function registerCommands(): void {
  logseq.Editor.registerSlashCommand('Image BG Remover: Selected Blocks', async () => {
    await removeBackgroundForSelectedBlocks()
  })

  logseq.App.registerCommandPalette(
    {
      key: 'image-bg-remover-selected-blocks',
      label: 'Image BG Remover: Selected Blocks',
    },
    async () => {
      await removeBackgroundForSelectedBlocks()
    }
  )

  logseq.App.registerUIItem('toolbar', {
    key: 'image-bg-remover-toolbar',
    template: '<a class="button" data-on-click="removeImageBackgrounds" title="Remove image backgrounds in selected blocks">BG</a>',
  })

  logseq.provideModel({
    async removeImageBackgrounds() {
      await removeBackgroundForSelectedBlocks()
    },
  })
}

async function main(): Promise<void> {
  registerCommands()
  console.log('[image-bg-remover] Plugin loaded')
}

logseq.ready(main).catch((error: unknown) => {
  console.error('[image-bg-remover] Failed to load plugin:', error)
})
