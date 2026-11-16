import { useCallback, useEffect, useState } from 'react'
import { fetchNews, relativeTime, type NewsItem, type NewsLang } from './lib/news'
import projects from './data/projects.json'
import collection from './data/collection.json'

/**
 * 数字文化资产与 IP 行业动态展示 App
 *
 * 合规边界（2026-09-16 与用户确认，详见 ../LEDGER.md）：
 * - 不出现金额、收益率、募集进度、份额价格等任何金融表述
 * - 无钱包、无链上调用、无交易入口；项目数据是构建期导出的静态 JSON
 * - 不外链到交易站点；动态条目按版权要求署名并回源 PANews；关于页提供官网、邮箱与隐私政策链接（2026-10-12）
 */

type Tab = 'news' | 'projects' | 'collection' | 'about'

const TABS: { key: Tab; zh: string; en: string; icon: string }[] = [
  { key: 'news', zh: '动态', en: 'Updates', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m0 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2v-9a2 2 0 00-2-2h-2M7 8h6M7 12h6M7 16h4' },
  { key: 'projects', zh: '项目', en: 'Projects', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { key: 'collection', zh: '藏品', en: 'Collection', icon: 'M4 16l4.59-4.59a2 2 0 012.82 0L16 16m-2-2l1.59-1.59a2 2 0 012.82 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { key: 'about', zh: '关于', en: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
]

const asset = (p: string) => `${import.meta.env.BASE_URL}${p}`

export function App() {
  const [tab, setTab] = useState<Tab>('news')
  const [lang, setLang] = useState<NewsLang>('zh')
  const zh = lang === 'zh'

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">IPChain</span>
        <button className="lang-btn" onClick={() => setLang(zh ? 'en' : 'zh')}>
          {zh ? 'EN' : '中文'}
        </button>
      </header>

      <main className="content">
        {tab === 'news' && <NewsView lang={lang} />}
        {tab === 'projects' && <ProjectsView lang={lang} />}
        {tab === 'collection' && <CollectionView lang={lang} />}
        {tab === 'about' && <AboutView lang={lang} />}
      </main>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.key} className={`tab${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            <svg className="tab-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
            </svg>
            <span>{zh ? t.zh : t.en}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/* ─────────── 动态 ─────────── */

function NewsView({ lang }: { lang: NewsLang }) {
  const zh = lang === 'zh'
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true)
    setFailed(false)
    fetchNews(lang, signal)
      .then((list) => setItems(list.slice(0, 40)))
      .catch((e) => { if ((e as Error).name !== 'AbortError') setFailed(true) })
      .finally(() => setLoading(false))
  }, [lang])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load])

  if (loading && items.length === 0) return <div className="empty">{zh ? '加载中…' : 'Loading…'}</div>

  if (failed && items.length === 0) {
    return (
      <div className="empty">
        <div>{zh ? '动态暂时无法加载，请检查网络' : 'Unable to load updates. Check your connection.'}</div>
        <button className="retry" onClick={() => load()}>{zh ? '重试' : 'Retry'}</button>
      </div>
    )
  }

  return (
    <>
      <div className="section-title">{zh ? '行业动态' : 'Industry Updates'}</div>
      {/* 每条署名来源并回源原文（2026-10-12 恢复，与关于页「动态说明」一致）。link 已在 lib/news.ts 校验为 PANews 域名。 */}
      <div className="news-list">
        {items.map((n) => (
          <a key={n.id} className="news-card" href={n.link}>
            {n.image && <img className="news-thumb" src={n.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
            <div className="news-body">
              <div className="news-title">{n.title}</div>
              <div className="news-meta">
                <span className="news-source">PANews</span>
                <span className="news-time">{relativeTime(n.publishedAt, lang)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="hint">
        {zh
          ? '动态摘要来自 PANews，版权归原作者所有。本应用仅展示标题、摘要与缩略图，点击条目可查看原文。'
          : 'Summaries are provided by PANews; copyright belongs to the original authors. Only headlines, summaries and thumbnails are shown — tap an item to read the original.'}
      </p>
    </>
  )
}

/* ─────────── IP 项目图鉴 ─────────── */

function ProjectsView({ lang }: { lang: NewsLang }) {
  const zh = lang === 'zh'
  return (
    <>
      <div className="section-title">{zh ? 'IP 项目图鉴' : 'IP Projects'}</div>
      <div className="grid">
        {projects.map((p) => (
          <div key={p.id} className="card">
            {p.poster
              ? <img className="card-img" src={asset(p.poster)} alt={p.name} loading="lazy" />
              : <div className="card-img-fallback">{p.name.replace(/^[\d\s]+/, '').slice(0, 1).toUpperCase()}</div>}
            <div className="card-body">
              <div className="card-title">{p.name}</div>
              <div className="card-meta">
                <span className="badge">{p.category}</span>
                <span>{p.stage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="hint">
        {zh
          ? '以上为平台参与数字化的 IP 项目，仅作展示，不构成任何要约或推荐。'
          : 'IP projects the platform helps digitalise. For display only; not an offer or recommendation.'}
      </p>
    </>
  )
}

/* ─────────── 数字文化资产藏品 ─────────── */

function CollectionView({ lang }: { lang: NewsLang }) {
  const zh = lang === 'zh'
  return (
    <>
      <div className="section-title">{zh ? '数字文化资产图鉴' : 'Digital Culture Collection'}</div>
      <div className="grid">
        {collection.map((c) => (
          <div key={c.id} className="card">
            <img className="card-img" src={asset(c.poster)} alt={c.title} loading="lazy" />
            <div className="card-body">
              <div className="card-title">{c.title}</div>
              <div className="card-meta"><span className="badge">{c.series}</span></div>
            </div>
          </div>
        ))}
      </div>
      <p className="hint">
        {zh
          ? '藏品图鉴仅作文化展示，应用内不提供任何购买、兑换或转让功能。'
          : 'A cultural showcase only. This app provides no purchase, redemption or transfer features.'}
      </p>
    </>
  )
}

/* ─────────── 关于 ─────────── */

const CONTACT_EMAIL = 'support@ipchain.art'
const WEBSITE_URL = 'https://www.ipchain.art'
const PRIVACY_URL = 'https://www.ipchain.art/privacy/'

function AboutView({ lang }: { lang: NewsLang }) {
  const zh = lang === 'zh'
  return (
    <div className="about">
      <h2>{zh ? '关于' : 'About'}</h2>
      <p>
        {zh
          ? 'IPChain 是文娱 IP（如演唱会、巡演）与数字文化视觉内容的展示应用。'
          : 'IPChain is a showcase app for entertainment IP (such as concerts and tours) and digital culture visual content.'}
      </p>
      <h2>{zh ? '我们做什么' : 'What we do'}</h2>
      <p>
        {zh
          ? '将 IP 项目信息整理为可浏览的数字图鉴，仅供展示。'
          : 'We organise IP project information into a browsable digital gallery, for display only.'}
      </p>
      <h2>{zh ? '动态说明' : 'About updates'}</h2>
      <p>
        {zh
          ? '应用内可能展示公开来源的行业动态（例如 PANews），并标明来源、提供原文链接。仅展示标题、摘要与缩略图。'
          : 'The app may show industry updates from public sources (for example PANews), with the source credited and a link to the original. Only headlines, summaries and thumbnails are shown.'}
      </p>
      <h2>{zh ? '功能边界' : 'Scope'}</h2>
      <p>
        {zh
          ? '仅供浏览与展示。无账户、无支付、无钱包、无交易、无投资建议。'
          : 'For browsing and display only. No accounts, no payments, no wallet, no trading, no investment advice.'}
      </p>
      <div className="contact">
        <h2>{zh ? '联系我们' : 'Contact Us'}</h2>
        <p>{zh ? '邮箱：' : 'Email: '}<a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        <p>{zh ? '官网：' : 'Website: '}<a href={WEBSITE_URL}>{WEBSITE_URL}</a></p>
      </div>
      <p>{zh ? '隐私政策：' : 'Privacy Policy: '}<a href={PRIVACY_URL}>{PRIVACY_URL}</a></p>
      <p className="muted">Version 1.0</p>
    </div>
  )
}
