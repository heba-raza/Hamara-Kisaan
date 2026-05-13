import { useState, useEffect } from 'react'
import { Form, InputNumber, Button, Card, Tag, message, Select, Spin } from 'antd'
import { CloudOutlined, FireOutlined, ExperimentOutlined,
         InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import { useTheme } from '../context/ThemeContext'

const { Option } = Select
const API = 'http://localhost:5000'

function Weather() {
  const [form]        = Form.useForm()
  const { dark }      = useTheme()
  const cardBg        = dark ? '#1a1f2e' : '#fff'
  const subColor      = dark ? '#9ca3af' : '#6b7280'

  const [city,        setCity]        = useState('Faisalabad')
  const [weather,     setWeather]     = useState(null)
  const [weatherLoad, setWeatherLoad] = useState(false)
  const [threshLoad,  setThreshLoad]  = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [alerts,      setAlerts]      = useState([])

  // ── Fetch live weather ──────────────────────────────────────────────────
  const fetchWeather = async (c) => {
    setWeatherLoad(true)
    try {
      const res  = await fetch(`${API}/api/weather/${c}`)
      const data = await res.json()
      if (data.error) message.error('Weather API error: ' + data.message)
      else setWeather(data)
    } catch {
      message.error('Could not reach Flask server')
    } finally {
      setWeatherLoad(false)
    }
  }

  // ── Load saved thresholds from DB ───────────────────────────────────────
  const loadThresholds = async () => {
    setThreshLoad(true)
    try {
      const res  = await fetch(`${API}/api/admin/weather-thresholds`, { credentials: 'include' })
      const data = await res.json()
      form.setFieldsValue({
        temp_max    : data.temp_max     ?? 42,
        temp_min    : data.temp_min     ?? 5,
        humidity_max: data.humidity_max ?? 85,
        wind_max    : data.wind_max     ?? 15,
        rain_max    : data.rain_max     ?? 10,
      })
    } catch {
      message.error('Could not load saved thresholds')
    } finally {
      setThreshLoad(false)
    }
  }

  // ── Load recent alerts ──────────────────────────────────────────────────
  const loadAlerts = async () => {
    try {
      const res  = await fetch(`${API}/api/admin/notifications`, { credentials: 'include' })
      const data = await res.json()
      setAlerts(Array.isArray(data) ? data.slice(0, 6) : [])
    } catch {
      // silent — non critical
    }
  }

  useEffect(() => {
    fetchWeather(city)
    loadThresholds()
    loadAlerts()
  }, [])

  // ── Save thresholds to DB ───────────────────────────────────────────────
  const handleSave = async (values) => {
    setSaving(true)
    try {
      const res  = await fetch(`${API}/api/admin/weather-thresholds`, {
        method     : 'POST',
        headers    : { 'Content-Type': 'application/json' },
        credentials: 'include',
        body       : JSON.stringify({ ...values, city }),
      })
      const data = await res.json()
      if (data.success) {
        message.success('✅ Thresholds saved to database')
      } else {
        message.error('Save failed — ' + (data.error || 'unknown error'))
      }
    } catch {
      message.error('Could not reach Flask server')
    } finally {
      setSaving(false)
    }
  }

  const typeColor = t => {
    if (!t) return 'default'
    const l = t.toLowerCase()
    if (l === 'critical') return 'red'
    if (l === 'warning')  return 'orange'
    return 'blue'
  }

  return (
    <div style={{ padding: 32 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: 0 }}>
          Weather Configuration
        </h1>
        <p style={{ color: subColor, margin: '4px 0 0' }}>
          Set thresholds — backend auto-sends SMS &amp; alerts when limits are crossed
        </p>
      </div>

      {/* Live weather */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Live Weather — {city}</span>
            <Button size="small" icon={<ReloadOutlined />}
              loading={weatherLoad} onClick={() => fetchWeather(city)}>
              Refresh
            </Button>
          </div>
        }
        style={{ marginBottom: 24, background: cardBg, borderRadius: 12 }}
      >
        <Spin spinning={weatherLoad}>
          {weather ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              {[
                { icon: '🌡️', label: 'Temperature', value: `${weather.temperature}°C` },
                { icon: '💧', label: 'Humidity',    value: `${weather.humidity}%`     },
                { icon: '💨', label: 'Wind Speed',  value: `${weather.wind} m/s`      },
                { icon: '☁️', label: 'Condition',   value: weather.condition           },
              ].map((w, i) => (
                <div key={i} style={{
                  background: dark ? '#111827' : '#f0fdf4',
                  borderRadius: 10, padding: '14px 16px',
                  border: '1px solid #bbf7d0', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24 }}>{w.icon}</div>
                  <div style={{ fontSize: 11, color: subColor, marginTop: 4 }}>{w.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#15803d' }}>{w.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: subColor }}>
              {weatherLoad ? 'Loading…' : 'Could not load weather. Check Flask terminal.'}
            </p>
          )}
        </Spin>
      </Card>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>

        {/* City selector */}
        <Card title="Location" style={{ background: cardBg, borderRadius: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: subColor }}>City</label>
              <Select value={city} style={{ width: '100%', marginTop: 4 }}
                onChange={v => { setCity(v); fetchWeather(v) }}>
                <Option value="Faisalabad">Faisalabad</Option>
                <Option value="Lahore">Lahore</Option>
                <Option value="Multan">Multan</Option>
                <Option value="Rawalpindi">Rawalpindi</Option>
                <Option value="Islamabad">Islamabad</Option>
              </Select>
            </div>
            <p style={{ fontSize: 12, color: subColor, margin: 0 }}>
              Alerts will be sent to farmers whose tehsil matches this city.
              If no match found, all farmers receive the alert.
            </p>
          </div>
        </Card>

        {/* Thresholds */}
        <Card
          title={
            <span>
              Alert Thresholds
              <Tooltip title="Backend triggers SMS + notifications when these are crossed">
                <InfoCircleOutlined style={{ marginLeft: 8, color: '#9ca3af' }} />
              </Tooltip>
            </span>
          }
          style={{ background: cardBg, borderRadius: 12 }}
        >
          <Spin spinning={threshLoad}>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="temp_max" label="Heatwave Max Temp (°C)" rules={[{ required: true }]}>
                <InputNumber min={30} max={60} style={{ width: '100%' }}
                  addonBefore={<FireOutlined style={{ color: '#ef4444' }} />} />
              </Form.Item>
              <Form.Item name="temp_min" label="Frost Min Temp (°C)" rules={[{ required: true }]}>
                <InputNumber min={-10} max={15} style={{ width: '100%' }}
                  addonBefore={<ExperimentOutlined style={{ color: '#06b6d4' }} />} />
              </Form.Item>
              <Form.Item name="humidity_max" label="Max Humidity (%)" rules={[{ required: true }]}>
                <InputNumber min={50} max={100} style={{ width: '100%' }}
                  addonBefore={<CloudOutlined style={{ color: '#3b82f6' }} />} />
              </Form.Item>
              <Form.Item name="wind_max" label="Max Wind Speed (m/s)" rules={[{ required: true }]}>
                <InputNumber min={5} max={50} style={{ width: '100%' }} addonBefore="💨" />
              </Form.Item>
              <Form.Item name="rain_max" label="Heavy Rain (mm/hr)" rules={[{ required: true }]}>
                <InputNumber min={1} max={200} style={{ width: '100%' }}
                  addonBefore={<CloudOutlined style={{ color: '#60a5fa' }} />} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}
                style={{ backgroundColor: '#15803d', width: '100%' }}>
                Save Thresholds to Database
              </Button>
            </Form>
          </Spin>
        </Card>
      </div>

      {/* Recent alerts from DB */}
      <Card title="Recent Auto-Alerts" style={{ background: cardBg, borderRadius: 12 }}>
        {alerts.length === 0 ? (
          <p style={{ color: subColor }}>No alerts triggered yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alerts.map((a, i) => (
              <div key={i} style={{
                padding: '12px 16px', borderRadius: 8,
                background: dark ? '#1a1f2e' : '#f9fafb',
                border: `1px solid ${dark ? '#2d3748' : '#e5e7eb'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <b style={{ color: dark ? '#f0f6fc' : '#111' }}>{a.title}</b>
                  <div style={{ fontSize: 12, color: subColor, marginTop: 2, maxWidth: 500 }}>
                    {a.message?.slice(0, 80)}…
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <Tag color={typeColor(a.type)} style={{ borderRadius: 20 }}>
                    {(a.type || 'alert').toUpperCase()}
                  </Tag>
                  <span style={{ fontSize: 11, color: subColor }}>
                    {new Date(a.created_at).toLocaleString('en-PK', {
                      day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Weather