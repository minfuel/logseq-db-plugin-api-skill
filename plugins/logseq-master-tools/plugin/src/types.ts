export type ToolKind = 'plugin' | 'workflow' | 'draft'

export interface ToolDefinition {
  id: string
  name: string
  summary: string
  keywords: string[]
  pageName: string
  actionHint: string
  kind: ToolKind
}

export interface PluginSettings {
  dashboardPageName: string
  defaultToolTag: string
  toolCatalogJson: string
  autoOpenMatchedToolPage: boolean
}

export interface RouteResult {
  matchedTool: ToolDefinition | null
  score: number
  reason: string
}

export const DEFAULT_TOOLS: ToolDefinition[] = [
  {
    id: 'quick-capture',
    name: 'Quick Capture',
    summary: 'Fast capture for inbox notes, TODO items, and quick ideas.',
    keywords: ['capture', 'inbox', 'note', 'todo', 'quick', 'journal'],
    pageName: 'Quick Capture',
    actionHint: 'Use the Quick Capture slash command or open the inbox page.',
    kind: 'plugin',
  },
  {
    id: 'bookmark-inbox',
    name: 'Bookmark Inbox',
    summary: 'Collect bookmarks, screenshots, and camera notes into Logseq with bookmark tagging.',
    keywords: ['bookmark', 'link', 'screenshot', 'image', 'camera', 'web'],
    pageName: 'Bookmark Inbox',
    actionHint: 'Use this flow when you want saved links or media moved into Logseq.',
    kind: 'workflow',
  },
  {
    id: 'entertainment-tracker',
    name: 'Entertainment Tracker',
    summary: 'Track movies, series, episodes, seasons, and watch progress.',
    keywords: ['movie', 'series', 'episode', 'season', 'watch', 'video', 'playlist'],
    pageName: 'Entertainment Tracker',
    actionHint: 'Use this flow for adding or updating things you are watching.',
    kind: 'workflow',
  },
  {
    id: 'procurement-compare',
    name: 'Procurement Compare',
    summary: 'Compare vendor prices for pickup purchases and attach recommendations under the request.',
    keywords: ['order', 'pickup', 'vendor', 'price', 'prisjakt', 'purchase', 'catalog'],
    pageName: 'Procurement Compare',
    actionHint: 'Use this flow when a material request needs a cheapest-vendor comparison.',
    kind: 'workflow',
  },
  {
    id: 'marketplace-monitor',
    name: 'Marketplace Monitor',
    summary: 'Watch marketplace listings and match them to material requests and tasks.',
    keywords: ['marketplace', 'finn', 'facebook', 'listing', 'monitor', 'match'],
    pageName: 'Marketplace Monitor',
    actionHint: 'Use this flow to scan external listings and relate them to open needs.',
    kind: 'workflow',
  },
  {
    id: 'listing-publisher',
    name: 'Listing Publisher',
    summary: 'Prepare and post buy or sell listings with target price and note templates.',
    keywords: ['post', 'listing', 'buy', 'sell', 'land', 'facebook', 'finn'],
    pageName: 'Listing Publisher',
    actionHint: 'Use this flow when you want to publish a structured marketplace post.',
    kind: 'workflow',
  },
]

export const DEFAULT_SETTINGS: PluginSettings = {
  dashboardPageName: 'Master Tools',
  defaultToolTag: 'master-tool',
  toolCatalogJson: JSON.stringify(DEFAULT_TOOLS, null, 2),
  autoOpenMatchedToolPage: true,
}