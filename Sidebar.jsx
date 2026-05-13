import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined, TeamOutlined, MedicineBoxOutlined,
  CloudOutlined, BulbOutlined, ExperimentOutlined,
  LogoutOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, BellOutlined,
  ReadOutlined, HistoryOutlined,
} from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const menuItems = [
  { key: '/dashboard',    label: 'Dashboard',     icon: <DashboardOutlined /> },
  { key: '/farmers',      label: 'Farmers',        icon: <TeamOutlined /> },
  { key: '/crops',        label: 'Crops',          icon: <ExperimentOutlined /> },
  { key: '/treatment',    label: 'Treatment',      icon: <MedicineBoxOutlined /> },
  { key: '/diagnosis',    label: 'Diagnosis',      icon: <BulbOutlined /> },
  { key: '/advisories',   label: 'Advisories',     icon: <ReadOutlined /> },
  { key: '/activity',     label: 'Activity Log',   icon: <HistoryOutlined /> },
  { key: '/weather',      label: 'Weather Config', icon: <CloudOutlined /> },
]



function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { dark }  = useTheme()

  const bg          = '#15803d'
  const activeBg    = 'rgba(255,255,255,0.15)'
  const hoverBg     = 'rgba(255,255,255,0.08)'
  const textColor   = 'rgba(255,255,255,0.85)'
  const activeText  = '#ffffff'
  const mutedText   = 'rgba(255,255,255,0.5)'

  const MenuItem = ({ item }) => {
    const active = location.pathname === item.key
    return (
      <div
        onClick={() => navigate(item.key)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '11px 16px', cursor: 'pointer',
          background: active ? activeBg : 'transparent',
          borderLeft: active ? '3px solid #fff' : '3px solid transparent',
          color: active ? activeText : textColor,
          fontWeight: active ? 600 : 400,
          fontSize: 14, transition: 'all 0.15s',
          borderRadius: '0 8px 8px 0',
          margin: '1px 8px 1px 0',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: 16, minWidth: 16 }}>{item.icon}</span>
        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
      </div>
    )
  }

  return (
    <div style={{
      width: collapsed ? 64 : 220,
      minHeight: '100vh',
      background: bg,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s',
      overflow: 'hidden',
      boxShadow: '2px 0 12px rgba(0,0,0,0.12)'
    }}>

      {/* Brand + logo */}
      <div style={{
        padding: '18px 12px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}>
        <div style={{
          width: collapsed ? 40 : 48,
          height: collapsed ? 40 : 48,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.28)',
          background: 'rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <img
            src="/hk-logo-circle.png"
            alt="Hamara Kisaan"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 999 }}
          />
        </div>
        {!collapsed && (
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 13, textAlign: 'center', lineHeight: 1.3 }}>
            Hamara Kisaan
          </span>
        )}
      </div>

      {/* Collapse toggle */}
      <div style={{
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-end',
        borderBottom: '1px solid rgba(255,255,255,0.15)'
      }}>
        <div onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
          style={{ cursor: 'pointer', color: mutedText, fontSize: 16 }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      </div>

      {/* Main menu */}
      <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {menuItems.map(item => <MenuItem key={item.key} item={item} />)}
      </div>

      {/* Bottom */}
      <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 16px', cursor: 'pointer',
            color: '#fca5a5', fontSize: 14,
            margin: '1px 8px 1px 0',
          }}
        >
          <span style={{ fontSize: 16, minWidth: 16 }}><LogoutOutlined /></span>
          {!collapsed && <span>Log out</span>}
        </div>
      </div>
    </div>
  )
}

export default Sidebar