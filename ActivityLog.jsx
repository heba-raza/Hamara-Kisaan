import { useState, useEffect, useCallback } from 'react'
import { Table, Tag, Card, Spin, Empty, Tooltip, Button } from 'antd'
import { InfoCircleOutlined, ReloadOutlined, MessageOutlined,
         BellOutlined, FileTextOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const API = 'http://localhost:5000'

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  SMS      : { color: 'blue',   label: 'SMS',   icon: <MessageOutlined /> },
  CRITICAL : { color: 'red',    label: 'ALERT', icon: <BellOutlined />    },
  WARNING  : { color: 'orange', label: 'WARN',  icon: <BellOutlined />    },
  ALERT    : { color: 'gold',   label: 'NOTIF', icon: <BellOutlined />    },
  NOTIF    : { color: 'green',  label: 'NOTIF', icon: <BellOutlined />    },
  NEWS     : { color: 'purple', label: 'NEWS',  icon: <FileTextOutlined />},
}

const getTypeCfg = t => TYPE_CONFIG[t] || TYPE_CONFIG.NOTIF

// ── Format date ───────────────────────────────────────────────────────────────
const fmtDate = iso => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ─────────────────────────────────────────────────────────────────────────────
function ActivityLog() {
  const { dark } = useTheme()
  const subColor = dark ? '#9ca3af' : '#6b7280'
  const cardBg   = dark ? '#1a1f2e' : '#fff'
  const border   = dark ? '#2d3748' : '#e5e7eb'

  const [feed,    setFeed]    = useState([])
  const [summary, setSummary] = useState({ sms: 0, notifs: 0, advisories: 0 })
  const [loading, setLoading] = useState(true)

  const fetchFeed = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/admin/activity-feed`, { credentials: 'include' })
      const data = await res.json()
      setFeed(data.feed || [])
      setSummary({
        sms       : data.sms_this_month        || 0,
        notifs    : data.notifs_this_month      || 0,
        advisories: data.advisories_this_month  || 0,
      })
    } catch {
      // Flask not running or auth expired — show empty state
      setFeed([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchFeed() }, [fetchFeed])

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns = [
    {
      title    : 'Type',
      dataIndex: 'type',
      key      : 'type',
      width    : 80,
      render   : t => {
        const cfg = getTypeCfg(t)
        return (
          <Tag
            color={cfg.color}
            icon={cfg.icon}
            style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
          >
            {cfg.label}
          </Tag>
        )
      },
      filters      : [
        { text: 'SMS',          value: 'SMS'      },
        { text: 'Critical Alert', value: 'CRITICAL'},
        { text: 'Warning',      value: 'WARNING'  },
        { text: 'Notification', value: 'NOTIF'    },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title : 'Message Sent',
      key   : 'message',
      render: (_, r) => (
        <div>
          {r.title && (
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
              {r.title}
            </div>
          )}
          <div style={{ fontSize: 13, color: dark ? '#e5e7eb' : '#1f2937' }}>
            {r.message}
          </div>
        </div>
      ),
    },
    {
      title : 'Recipient',
      key   : 'recipient_info',
      width : 160,
      render: (_, r) => (
        <div>
          {r.type === 'SMS'
            ? (
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: subColor }}>
                📱 {r.recipient_info}
              </span>
            ) : (
              <Tag color="green" style={{ borderRadius: 20, fontSize: 11 }}>
                {r.recipient_info === 'all' ? '📢 All Farmers' : `🌾 ${r.recipient_info}`}
              </Tag>
            )
          }
        </div>
      ),
    },
    {
      title    : (
        <span>
          Reason&nbsp;
          <Tooltip title="Why the backend triggered this message">
            <InfoCircleOutlined style={{ color: subColor }} />
          </Tooltip>
        </span>
      ),
      dataIndex: 'reason',
      key      : 'reason',
      render   : r => (
        <span style={{ fontSize: 12, color: subColor, lineHeight: 1.5 }}>{r}</span>
      ),
    },
    {
      title : 'Time',
      key   : 'created_at',
      width : 160,
      render: (_, r) => (
        <span style={{ fontSize: 12, color: subColor, whiteSpace: 'nowrap' }}>
          {fmtDate(r.created_at)}
        </span>
      ),
      sorter: (a, b) => (a.created_at || '').localeCompare(b.created_at || ''),
      defaultSortOrder: 'descend',
    },
    {
      title : 'Status',
      key   : 'status',
      width : 100,
      render: (_, r) => {
        const s   = (r.status || 'simulated').toLowerCase()
        const map = {
          sent      : 'green',
          delivered : 'green',
          simulated : 'blue',
          failed    : 'red',
        }
        return (
          <Tag color={map[s] || 'blue'} style={{ borderRadius: 20, fontSize: 11 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Tag>
        )
      },
    },
  ]

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: 32, minHeight: '100vh', background: dark ? '#0f1117' : '#f0fdf4' }}>

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: 0 }}>
            Activity Log
          </h1>
          <p style={{ color: subColor, margin: '4px 0 0', fontSize: 14 }}>
            All automated alerts and notifications sent by the backend — weather triggers, disease alerts, and advisories
          </p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchFeed} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'SMS Sent This Month',              value: summary.sms,         color: '#2563eb', icon: '📱' },
          { label: 'Alerts & Notifications This Month',value: summary.notifs,      color: '#15803d', icon: '🔔' },
          { label: 'Advisories This Month',            value: summary.advisories,  color: '#7c3aed', icon: '📋' },
        ].map((s, i) => (
          <div key={i} style={{
            background  : cardBg,
            borderRadius: 12,
            padding     : 20,
            border      : `1px solid ${border}`,
            display     : 'flex',
            alignItems  : 'center',
            gap         : 16,
          }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 12, color: subColor }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1.1 }}>
                {s.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main table */}
      <Card
        style={{ background: cardBg, borderRadius: 12, border: `1px solid ${border}` }}
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={loading}>
          {!loading && feed.length === 0
            ? (
              <div style={{ padding: 48 }}>
                <Empty
                  description={
                    <span style={{ color: subColor }}>
                      No activity yet — weather alerts and SMS will appear here automatically
                      once thresholds are crossed
                    </span>
                  }
                />
              </div>
            )
            : (
              <Table
                columns={columns}
                dataSource={feed.map((r, i) => ({ ...r, key: r.id || i }))}
                pagination={{ pageSize: 10, size: 'small' }}
                scroll={{ x: 900 }}
                size="middle"
                style={{ borderRadius: 12 }}
              />
            )
          }
        </Spin>
      </Card>
    </div>
  )
}

export default ActivityLog