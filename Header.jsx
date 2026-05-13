import { UserOutlined, ArrowLeftOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Avatar, Switch, Tooltip } from 'antd'
import { useTheme } from '../context/ThemeContext'

function Header() {
  const navigate = useNavigate()
  const { dark, toggle } = useTheme()

  /* Light: soft celadon #C1E1C1 + dark type. Dark: #355E3B + light type */
  const headerBg = dark ? '#355E3B' : '#C1E1C1'
  const headerBorder = dark ? 'rgba(0, 0, 0, 0.18)' : 'rgba(53, 94, 59, 0.22)'

  return (
    <div style={{
      height: 64,
      background: headerBg,
      borderBottom: `1px solid ${headerBorder}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 99,
      transition: 'all 0.3s'
    }}>

      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Tooltip title="Go back">
          <ArrowLeftOutlined
            onClick={() => navigate(-1)}
            style={{
              fontSize: 16, cursor: 'pointer',
              color: dark ? 'rgba(255, 255, 255, 0.88)' : '#355E3B'
            }}
          />
        </Tooltip>
        {/* Logo */}
        <div style={{
          width: 52, height: 52, borderRadius: 999,
          background: dark ? 'rgba(255, 255, 255, 0.10)' : '#ffffff',
          border: dark ? '1px solid rgba(255, 255, 255, 0.28)' : '1px solid rgba(53, 94, 59, 0.22)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: dark ? 'inset 0 1px 0 rgba(255,255,255,0.12)' : '0 1px 3px rgba(53,94,59,0.12)',
          overflow: 'hidden',
        }}>
          <img
            src="/hk-logo-circle.png"
            alt="Hamara Kisaan"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 999 }}
          />
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: dark ? '#f8faf8' : '#2d4a32' }}>
          Hamara Kisaan
        </span>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Dark mode toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SunOutlined style={{ color: dark ? '#fde68a' : '#b45309', fontSize: 16 }} />
          <Switch
            checked={dark}
            onChange={toggle}
            size="small"
            style={{ background: dark ? '#15803d' : '#cbd5e1' }}
          />
          <MoonOutlined style={{ color: dark ? '#d8b4fe' : '#355E3B', fontSize: 16 }} />
        </div>

        {/* Admin info */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 13, fontWeight: 600,
            color: dark ? '#f8faf8' : '#2d4a32'
          }}>
            Admin User
          </div>
          <div style={{
            fontSize: 11,
            color: dark ? 'rgba(232, 245, 233, 0.72)' : '#4a6b52'
          }}>ID: ADM-001</div>
        </div>
        <Avatar size={38} icon={<UserOutlined />}
          style={{
            backgroundColor: '#15803d',
            cursor: 'pointer',
            border: dark ? '2px solid rgba(255,255,255,0.35)' : '2px solid rgba(53,94,59,0.25)',
          }} />
      </div>
    </div>
  )
}

export default Header