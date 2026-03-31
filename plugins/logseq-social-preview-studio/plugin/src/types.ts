export type PlatformId =
  | 'instagram'
  | 'snapchat'
  | 'facebook'
  | 'youtube'
  | 'tiktok'
  | 'adsense'
  | 'generic'

export interface PlatformTemplate {
  id: PlatformId
  label: string
  layoutHint: string
  ctaDefault: string
  aspectRatio: string
}

export interface PluginSettings {
  targetPageName: string
  creatorName: string
  handle: string
  defaultCta: string
}

export const DEFAULT_SETTINGS: PluginSettings = {
  targetPageName: 'Social Preview Studio',
  creatorName: 'Your Brand',
  handle: '@yourbrand',
  defaultCta: 'Learn more',
}

export const PLATFORM_TEMPLATES: PlatformTemplate[] = [
  {
    id: 'instagram',
    label: 'Instagram Post',
    layoutHint: 'Square feed card with strong cover visual and short caption.',
    ctaDefault: 'Save for later',
    aspectRatio: '1:1',
  },
  {
    id: 'snapchat',
    label: 'Snapchat Story',
    layoutHint: 'Vertical story with a fast hook and a direct swipe-up prompt.',
    ctaDefault: 'Swipe up',
    aspectRatio: '9:16',
  },
  {
    id: 'facebook',
    label: 'Facebook Feed',
    layoutHint: 'Text-forward post with supporting image and trust-oriented copy.',
    ctaDefault: 'Read more',
    aspectRatio: '1.91:1',
  },
  {
    id: 'youtube',
    label: 'YouTube Video',
    layoutHint: 'Thumbnail plus title and 2-line description that highlights value.',
    ctaDefault: 'Watch now',
    aspectRatio: '16:9',
  },
  {
    id: 'tiktok',
    label: 'TikTok Short',
    layoutHint: 'Fast vertical short with bold opening line and trend-compatible tags.',
    ctaDefault: 'Try this',
    aspectRatio: '9:16',
  },
  {
    id: 'adsense',
    label: 'AdSense Display Ad',
    layoutHint: 'Compact ad unit with concise headline, benefit, and one action.',
    ctaDefault: 'Shop now',
    aspectRatio: 'Responsive',
  },
  {
    id: 'generic',
    label: 'Generic Social Card',
    layoutHint: 'Reusable card for other channels with adjustable title and CTA.',
    ctaDefault: 'Explore',
    aspectRatio: 'Flexible',
  },
]
