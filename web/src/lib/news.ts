/**
 * 行业动态 —— 直连 PANews RSS
 *
 * 为什么能直连：该源返回 `access-control-allow-origin: *`（2026-09-16 实测），
 * 浏览器/WebView 里 fetch 不会被 CORS 挡，因此**不需要我们自己的服务端代理**，
 * App 也就不会向 ipchain.art 发任何请求。
 *
 * 版权边界（沿用主站 packages/frontend/src/lib/news.ts 的约定）：
 * 只展示 标题 / 摘要 / 缩略图 / 来源署名 / 回源链接，**不转载全文**。
 * feed 里的 content:encoded 是全文 HTML，这里不取也不展示。
 */

export interface NewsItem {
  id: string
  title: string
  summary: string
  link: string
  image: string | null
  publishedAt: number
}

export type NewsLang = 'zh' | 'en'

const FEED = 'https://www.panewslab.com/rss.xml'
/** 只信任源站域名 —— feed 内容远端可控，链接与图片渲染前必须校验 */
const ALLOWED_HOST = /(^|\.)panewslab\.com$/i
/** 单条硬过期：太旧的新闻不展示，源站异常时的兜底 */
const MAX_AGE = 48 * 60 * 60 * 1000

function safeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  try {
    const u = new URL(raw)
    if (u.protocol !== 'https:') return null
    if (!ALLOWED_HOST.test(u.hostname)) return null
    return u.toString()
  } catch {
    return null
  }
}

function text(el: Element | null | undefined): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export async function fetchNews(lang: NewsLang, signal?: AbortSignal): Promise<NewsItem[]> {
  const res = await fetch(`${FEED}?type=NEWS&lang=${lang}`, { signal, cache: 'no-store' })
  if (!res.ok) throw new Error(`feed ${res.status}`)
  const xml = await res.text()

  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('feed parse error')

  const floor = Date.now() - MAX_AGE
  const items: NewsItem[] = []

  for (const node of Array.from(doc.getElementsByTagName('item'))) {
    const link = safeUrl(text(node.getElementsByTagName('link')[0]))
    const title = text(node.getElementsByTagName('title')[0])
    if (!link || !title) continue

    const ts = Date.parse(text(node.getElementsByTagName('pubDate')[0]))
    const publishedAt = Number.isNaN(ts) ? 0 : ts
    if (publishedAt && publishedAt < floor) continue

    // media:thumbnail / media:content 带命名空间，用 NS 通配取
    let image: string | null = null
    for (const tag of ['thumbnail', 'content']) {
      const el = node.getElementsByTagNameNS('*', tag)[0]
      const url = safeUrl(el?.getAttribute('url'))
      if (url) { image = url; break }
    }

    items.push({
      id: text(node.getElementsByTagName('guid')[0]) || link,
      title,
      // description 是纯文本摘要；剥掉可能残留的标签
      summary: text(node.getElementsByTagName('description')[0]).replace(/<[^>]+>/g, ' ').trim(),
      link,
      image,
      publishedAt,
    })
  }

  return items.sort((a, b) => b.publishedAt - a.publishedAt)
}

/** 相对时间：刚刚 / n 分钟前 / n 小时前 / n 天前，超过 7 天回落到日期 */
export function relativeTime(ts: number, lang: NewsLang): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  const zh = lang === 'zh'
  if (diff < 60_000) return zh ? '刚刚' : 'just now'
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return zh ? `${mins} 分钟前` : `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return zh ? `${hours} 小时前` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days <= 7) return zh ? `${days} 天前` : `${days}d ago`
  return new Date(ts).toLocaleDateString(zh ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
}
