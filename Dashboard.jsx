import { useState, useEffect } from 'react'
import { Card, Table, Badge, Spin, Tag } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useTheme } from '../context/ThemeContext'

const API = 'http://localhost:5000'

const columns = [
  {
    title    : 'Name',
    dataIndex: 'full_name',
    key      : 'full_name',
    render   : v => <span style={{ fontWeight: 500 }}>{v || '—'}</span>,
  },
  {
    title    : 'Phone',
    dataIndex: 'phone',
    key      : 'phone',
    render   : v => <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{v}</span>,
  },
  {
    title    : 'Crop',
    dataIndex: 'crop_type',
    key      : 'crop_type',
    render   : v => v ? <Tag color="green">{v}</Tag> : <span style={{ color: '#ccc' }}>—</span>,
  },
  {
    title : 'Registered',
    dataIndex: 'created_at',
    key   : 'created_at',
    render: v => v ? new Date(v).toLocaleDateString('en-PK', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : '—',
  },
  {
    title : 'Status',
    key   : 'status',
    render: () => <Badge status="success" text="Active" />,
  },
]

function Dashboard() {
  const { dark } = useTheme()
  const [stats,   setStats]   = useState(null)
  const [chart,   setChart]   = useState([])
  const [loading, setLoading] = useState(true)
  const pageBg   = dark ? '#0f1117' : '#f0fdf4'
  const subColor = dark ? '#9ca3af' : '#6b7280'
  const cardSurface = dark ? '#1a1f2e' : '#fff'
  const skeletonBg = dark ? '#374151' : '#e5e7eb'

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [s, c] = await Promise.all([
          fetch(`${API}/api/admin/dashboard`,       { credentials: 'include' }).then(r => r.json()),
          fetch(`${API}/api/admin/dashboard/chart`, { credentials: 'include' }).then(r => r.json()),
        ])
        setStats(s)
        setChart(Array.isArray(c) ? c : [])
      } catch {
        // Flask not reachable — stats stay null, empty state shown
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const statCards = stats ? [
    {
      title: 'Total Farmers',
      value: stats.total_farmers ?? 0,
      bg   : '#f0fdf4', color: '#15803d',
    },
    {
      title: 'Active Alerts',
      value: stats.active_alerts ?? 0,
      bg   : '#fef2f2', color: '#dc2626',
    },
    {
      title: 'Disease Diagnoses',
      value: stats.total_diagnoses ?? 0,
      bg   : '#fefce8', color: '#ca8a04',
    },
    {
      title: 'Active Crop Types',
      value: stats.active_crops ?? 0,
      bg   : '#eff6ff', color: '#2563eb',
    },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: pageBg, padding: '32px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#15803d', margin: 0 }}>
          🌾 Hamara Kisaan — Admin Dashboard
        </h1>
        <p style={{ color: subColor, marginTop: 4 }}>Welcome back, Admin</p>
      </div>

      <Spin spinning={loading}>

        {/* Stat Cards */}
        <div style={{
          display            : 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap                : 16,
          marginBottom       : 24,
        }}>
          {loading
            ? [1,2,3,4].map(i => (
              <div key={i} style={{
                background: skeletonBg, borderRadius: 14,
                padding: '24px', height: 100,
              }} />
            ))
            : statCards.map((s, i) => (
              <div key={i} style={{
                background  : s.bg,
                borderRadius: 14,
                padding     : '20px 24px',
                border      : `1px solid ${s.color}22`,
              }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: s.color, margin: 0 }}>
                  {s.title}
                </p>
                <p style={{ fontSize: 40, fontWeight: 700, color: s.color, margin: '6px 0 0' }}>
                  {s.value}
                </p>
              </div>
            ))
          }
        </div>

        {/* Chart */}
        <Card
          title="Farmer Registrations (Last 6 Months)"
          style={{ marginBottom: 24, borderRadius: 12, background: cardSurface }}
        >
          {chart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: subColor }}>
              No registration data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="farmers" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Farmers Table */}
        <Card title="Recently Registered Farmers" style={{ borderRadius: 12, background: cardSurface }}>
          <Table
            columns={columns}
            dataSource={(stats?.recent_activity || []).map((r, i) => ({ ...r, key: i }))}
            pagination={false}
            locale={{ emptyText: 'No farmers registered yet' }}
          />
        </Card>

      </Spin>
    </div>
  )
}

export default Dashboard