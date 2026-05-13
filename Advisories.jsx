import { useState, useEffect } from 'react'
import { Tag, Card, Button, message, Input, Select, Spin, Alert, Modal } from 'antd'
import { SendOutlined, SearchOutlined, ReloadOutlined, TranslationOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const { Search } = Input
const { Option } = Select

const NEWSAPI_KEY = '205a9c950a424535bd788b1366ca628d'
const API_BASE    = 'http://localhost:5000'   // ← your Flask backend

const categoryQueries = {
  Weather   : 'Pakistan weather agriculture farmers',
  Crops     : 'Pakistan crops wheat rice farming',
  Economy   : 'Pakistan agriculture economy farmers market',
  Irrigation: 'Pakistan irrigation water farming',
}

const categoryColors = { Weather: 'blue', Crops: 'green', Economy: 'gold', Irrigation: 'cyan' }
const categoryIcons  = { Weather: '🌧️', Crops: '🌾', Economy: '💰', Irrigation: '💧' }

function Advisories() {
  const { dark } = useTheme()
  const [articles, setArticles]         = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [forwarding, setForwarding]     = useState({})   // { [url]: 'loading' | 'done' | 'error' }
  const [previewItem, setPreviewItem]   = useState(null) // article being previewed after translation
  const [filter, setFilter]             = useState('Crops')
  const [search, setSearch]             = useState('')

  const cardBg   = dark ? '#1a1f2e' : '#fff'
  const subColor = dark ? '#9ca3af' : '#6b7280'

  // ── Fetch news from NewsAPI ──────────────────────────────────────────────
  const fetchNews = async (category) => {
    setLoading(true)
    setError(null)
    setArticles([])
    try {
      const query = categoryQueries[category]
      const url   = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWSAPI_KEY}`
      const res   = await fetch(url)
      const data  = await res.json()
      if (data.status === 'error') throw new Error(data.message)
      const filtered = data.articles.filter(a =>
        a.title && a.description &&
        a.title !== '[Removed]' &&
        a.description !== '[Removed]'
      )
      setArticles(filtered)
    } catch (err) {
      setError('Could not load news. Check your API key or internet connection.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNews(filter) }, [filter])

  // ── Translate + Forward to farmers via Flask ─────────────────────────────
  const handleForward = async (article) => {
    const key = article.url

    // Optimistically mark as loading
    setForwarding(prev => ({ ...prev, [key]: 'loading' }))

    try {
      const res = await fetch(`${API_BASE}/api/admin/translate-and-forward`, {
        method     : 'POST',
        credentials: 'include',           // send session cookie
        headers    : { 'Content-Type': 'application/json' },
        body       : JSON.stringify({
          title      : article.title,
          description: article.description,
          category   : filter,
          url        : article.url,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Forward failed')
      }

      setForwarding(prev => ({ ...prev, [key]: 'done' }))

      // Show a preview modal with the Urdu translation
      setPreviewItem({
        ...article,
        title_ur      : data.title_ur,
        description_ur: data.description_ur,
      })

      message.success('Article translated and forwarded to all farmers!')

    } catch (err) {
      setForwarding(prev => ({ ...prev, [key]: 'error' }))
      message.error(`Failed to forward: ${err.message}`)
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const forwardState = (url) => forwarding[url] || 'idle'

  const displayed = articles.filter(a =>
    search === '' ||
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: 0 }}>
          Advisories & News
        </h1>
        <p style={{ color: subColor, margin: '4px 0 0' }}>
          Live news from NewsAPI — translate to Urdu and forward directly to farmers
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Search
          placeholder="Search articles..."
          prefix={<SearchOutlined />}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 260 }}
          allowClear
        />
        <Select value={filter} onChange={v => setFilter(v)} style={{ width: 180 }}>
          <Option value="Weather">🌧️ Weather</Option>
          <Option value="Crops">🌾 Crops</Option>
          <Option value="Economy">💰 Economy</Option>
          <Option value="Irrigation">💧 Irrigation</Option>
        </Select>
        <Button icon={<ReloadOutlined />} onClick={() => fetchNews(filter)}>
          Refresh
        </Button>
        {!loading && (
          <Tag color="blue" style={{ padding: '4px 12px', fontSize: 13 }}>
            {displayed.length} articles
          </Tag>
        )}
      </div>

      {/* Error */}
      {error && (
        <Alert type="error" message={error} style={{ marginBottom: 16 }} showIcon />
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <p style={{ color: subColor, marginTop: 16 }}>Loading latest news...</p>
        </div>
      )}

      {/* Articles */}
      {!loading && !error && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayed.length === 0 && (
            <div style={{ textAlign: 'center', color: subColor, padding: 40 }}>
              No articles found. Try a different category.
            </div>
          )}

          {displayed.map((article, i) => {
            const state = forwardState(article.url)
            const date  = new Date(article.publishedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })

            return (
              <Card key={i}
                style={{ background: cardBg, borderRadius: 12 }}
                bodyStyle={{ padding: 20 }}>
                <div style={{ display: 'flex', gap: 16 }}>

                  {/* Thumbnail */}
                  {article.urlToImage ? (
                    <img
                      src={article.urlToImage} alt=""
                      style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{
                      width: 60, height: 60, borderRadius: 10, flexShrink: 0,
                      background: '#f0fdf4', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: 24
                    }}>
                      {categoryIcons[filter]}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                      <Tag color={categoryColors[filter]}>{filter}</Tag>
                      {article.source?.name && <Tag color="default">{article.source.name}</Tag>}
                      <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{date}</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, lineHeight: 1.4 }}>
                      {article.title}
                    </div>

                    {/* Description */}
                    <div style={{ fontSize: 13, color: subColor, lineHeight: 1.6, marginBottom: 12 }}>
                      {article.description}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

                      {/* Forward button — three states */}
                      {state === 'idle' && (
                        <Button
                          type="primary"
                          icon={<TranslationOutlined />}
                          size="small"
                          onClick={() => handleForward(article)}
                          style={{ backgroundColor: '#15803d', borderColor: '#15803d' }}
                        >
                          Translate & Forward to Farmers
                        </Button>
                      )}
                      {state === 'loading' && (
                        <Button size="small" loading disabled>
                          Translating to Urdu...
                        </Button>
                      )}
                      {state === 'done' && (
                        <Button size="small" disabled icon={<span>✓</span>}>
                          Forwarded to Farmers
                        </Button>
                      )}
                      {state === 'error' && (
                        <Button size="small" danger onClick={() => handleForward(article)}>
                          Retry Forward
                        </Button>
                      )}

                      <Button size="small" onClick={() => window.open(article.url, '_blank')}>
                        Read Full Article
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Translation Preview Modal */}
      <Modal
        open={!!previewItem}
        title="Urdu Translation Preview"
        onCancel={() => setPreviewItem(null)}
        footer={[
          <Button key="close" onClick={() => setPreviewItem(null)}>Close</Button>
        ]}
        width={580}
      >
        {previewItem && (
          <div style={{ direction: 'rtl', fontFamily: 'Noto Sans Arabic, sans-serif' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#0a4d28' }}>
              {previewItem.title_ur}
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.9, color: '#374151' }}>
              {previewItem.description_ur}
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, direction: 'ltr' }}>
              This advisory has been saved and is now visible to all farmers in the app.
            </p>
          </div>
        )}
      </Modal>

    </div>
  )
}

export default Advisories