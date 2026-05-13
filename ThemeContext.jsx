import { createContext, useContext, useState, useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('hk-theme') === 'dark'
  })

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('hk-theme', next ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <ConfigProvider theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#15803d',
          borderRadius: 8,
        }
      }}>
        <div style={{
          background: dark ? '#0f1117' : '#f0fdf4',
          minHeight: '100vh',
          transition: 'background 0.3s'
        }}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)