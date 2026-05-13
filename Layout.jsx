import Sidebar from './Sidebar'
import Header from './Header'
import { useTheme } from '../context/ThemeContext'

function Layout({ children }) {
  const { dark } = useTheme()
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{
        flex: 1, overflow: 'auto',
        display: 'flex', flexDirection: 'column',
        background: dark ? '#0f1117' : '#f0fdf4',
        transition: 'background 0.3s'
      }}>
        <Header />
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout