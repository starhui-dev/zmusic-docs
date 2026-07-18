export type SiteIconName =
  | 'home'
  | 'lightbulb'
  | 'circle-help'
  | 'circle-info'
  | 'music'
  | 'qq'
  | 'wechat'
  | 'discord'
  | 'book-open'
  | 'signpost'
  | 'terminal'
  | 'shield'
  | 'settings'
  | 'megaphone'

const localeLabels = new Set(['简体中文', 'English', '日本語'])

const homeLabels = new Set(['首页', 'Home', 'ホーム'])

const docIconMap: Record<string, SiteIconName> = {
  '/': 'home',
  '/guide': 'lightbulb',
  '/guide/introduction': 'circle-info',
  '/guide/getting-started': 'signpost',
  '/guide/commands': 'terminal',
  '/guide/permissions': 'shield',
  '/guide/config': 'settings',
  '/faq': 'circle-help',
  '/group': 'megaphone',
  '/v2': 'book-open',
  '/v2/faq': 'circle-help',
  '/netease-api': 'music',
  '/netease-api/public': 'music',
  '/netease-api/standard': 'music',
  '/netease-api/enhanced': 'music',
  '/netease-api-standard': 'music',
  '/netease-api-enhanced': 'music'
}

function normalizeDocLink(link: string) {
  const path = link.split(/[?#]/, 1)[0]
  const withoutHtml = path.replace(/\.html$/, '')
  const withoutLocale = withoutHtml.replace(/^\/(?:en|ja)(?=\/|$)/, '')

  if (withoutLocale === '') return '/'
  if (withoutLocale !== '/' && withoutLocale.endsWith('/')) {
    return withoutLocale.slice(0, -1)
  }

  return withoutLocale
}

export function getSiteIconName(link?: string, text?: string): SiteIconName | null {
  if (!link) return null
  if (text && localeLabels.has(text)) return null

  if (/discord\.gg/.test(link)) return 'discord'
  if (/(?:jq|qm)\.qq\.com/.test(link) || link === '#qq-group') return 'qq'
  if (link === '#wechat-group') return 'wechat'

  if (homeLabels.has(text ?? '')) return 'home'

  return docIconMap[normalizeDocLink(link)] ?? null
}
