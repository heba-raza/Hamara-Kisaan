import { useState } from 'react'
import { Form, Input, Button, Alert } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

function Login() {
  const navigate  = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const onLogin = async (values) => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('http://localhost:5000/api/admin/login', {
        method     : 'POST',
        headers    : { 'Content-Type': 'application/json' },
        credentials: 'include',
        body       : JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      })
      const data = await res.json()
      if (data.success) {
        navigate('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials')
      }
    } catch {
      setError('Cannot reach server — is Flask running on port 5000?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight     : '100vh',
      background    : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      display       : 'flex',
      alignItems    : 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background  : '#fff',
        padding     : '48px 40px',
        borderRadius: 20,
        boxShadow   : '0 8px 40px rgba(0,0,0,0.10)',
        width       : '100%',
        maxWidth    : 420,
      }}>

        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width         : 80, height: 80, borderRadius: 999,
            background    : '#f0fdf4', border: '1px solid rgba(21,128,61,0.18)',
            display       : 'flex', alignItems: 'center', justifyContent: 'center',
            margin        : '0 auto 14px',
            overflow      : 'hidden',
          }}>
            <img
              src="/hk-logo-circle.png"
              alt="Hamara Kisaan"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 999 }}
            />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#15803d', margin: 0 }}>
            Hamara Kisaan
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            Admin Portal
          </p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onLogin} requiredMark={false}>
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="admin"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="••••••••"
              size="large"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                backgroundColor: '#15803d',
                border          : 'none',
                borderRadius    : 8,
                height          : 46,
                fontWeight      : 600,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Form.Item>
        </Form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
          username: <code>admin</code> &nbsp;·&nbsp; password: <code>admin123</code>
        </p>
      </div>
    </div>
  )
}

export default Login