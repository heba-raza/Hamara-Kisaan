import { useState, useEffect, useCallback } from 'react'
import { Table, Tag, Button, Modal, Badge, Form, Input, Select, message, Spin } from 'antd'
import { CheckOutlined, CloseOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons'
import { API_BASE } from '../api/config'
import { useTheme } from '../context/ThemeContext'

const { TextArea } = Input
const { Option } = Select

const DISEASE_OPTIONS = [
  'Wheat Rust', 'Rice Blast', 'Powdery Mildew', 'Brown Spot',
  'Cotton Leaf Curl', 'Leaf Blight', 'Septoria', 'Fusarium Head Blight',
  'Yellow Rust', 'Bacterial Leaf Blight', 'No Disease',
]

const STATUS_BADGE  = { pending: 'warning', verified: 'success', overridden: 'processing' }
const STATUS_COLOR  = { pending: 'orange',  verified: 'green',   overridden: 'blue' }
const CONF_COLOR    = (c) => c >= 0.9 ? 'green' : c >= 0.75 ? 'orange' : 'red'
const FMT_CONF      = (c) => typeof c === 'number' ? `${(c * 100).toFixed(1)}%` : c

function Diagnosis() {
  const { dark } = useTheme()
  const cardBg = dark ? '#1a1f2e' : '#fff'
  const subColor = dark ? '#9ca3af' : '#6b7280'
  const urduBoxBg = dark ? '#111827' : '#f9fafb'
  const [reports,     setReports]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [selected,    setSelected]    = useState(null)
  const [overrideOpen, setOverrideOpen] = useState(false)
  const [overrideTarget, setOverrideTarget] = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [form] = Form.useForm()

  // ── Fetch from Flask ──────────────────────────────────────────────
  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/api/admin/diagnosis?limit=100`, {
        credentials: 'include',
      })
      const data = await res.json()
      // Normalise: map DB snake_case fields to what the table expects
      setReports(data.map(r => ({
        key:              r.id,
        id:               r.id,
        farmer:           r.full_name || `Farmer #${r.user_id || '—'}`,
        phone:            r.phone     || '—',
        crop:             r.crop_type || '—',
        prediction:       r.disease_name || '—',
        confidence:       r.confidence ?? 0,
        treatment:        r.treatment || '',
        status:           r.status   || 'pending',
        detectedAt:       r.detected_at,
        adminDiagnosis:   r.admin_diagnosis   || null,
        adminTreatment:   r.admin_treatment   || null,
        adminTreatmentUr: r.admin_treatment_ur || null,
        imagePath:        r.image_path || null,
      })))
    } catch (e) {
      message.error('Failed to load diagnosis reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReports() }, [fetchReports])

  // ── Verify ────────────────────────────────────────────────────────
  const handleVerify = async (record) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/diagnosis/${record.id}/verify`, {
        method: 'PATCH',
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      message.success('Prediction verified — farmer will be notified.')
      setSelected(null)
      // Optimistic update
      setReports(prev => prev.map(r =>
        r.id === record.id ? { ...r, status: 'verified' } : r
      ))
    } catch {
      message.error('Could not verify — try again.')
    }
  }

  // ── Override submit ───────────────────────────────────────────────
  const handleOverrideSubmit = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/diagnosis/${overrideTarget.id}/override`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_diagnosis:    values.diagnosis,
            admin_treatment:    values.treatment,
            admin_treatment_ur: values.treatmentUr || '',
          }),
        }
      )
      if (!res.ok) throw new Error()
      message.success('Your diagnosis sent to farmer!')
      setOverrideOpen(false)
      setSelected(null)
      form.resetFields()
      // Optimistic update
      setReports(prev => prev.map(r =>
        r.id === overrideTarget.id
          ? {
              ...r,
              status:           'overridden',
              adminDiagnosis:   values.diagnosis,
              adminTreatment:   values.treatment,
              adminTreatmentUr: values.treatmentUr || '',
            }
          : r
      ))
    } catch {
      message.error('Could not save override — try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Table columns ─────────────────────────────────────────────────
  const columns = [
    {
      title: 'Farmer',
      key: 'farmer',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.farmer}</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{r.phone}</div>
        </div>
      ),
    },
    { title: 'Crop',          dataIndex: 'crop',       key: 'crop' },
    { title: 'AI Prediction', dataIndex: 'prediction', key: 'prediction' },
    {
      title: 'Confidence', dataIndex: 'confidence', key: 'confidence',
      render: c => <Tag color={CONF_COLOR(c)}>{FMT_CONF(c)}</Tag>,
    },
    {
      title: 'Status', dataIndex: 'status', key: 'status',
      filters: [
        { text: 'Pending',    value: 'pending' },
        { text: 'Verified',   value: 'verified' },
        { text: 'Overridden', value: 'overridden' },
      ],
      onFilter: (value, record) => record.status === value,
      render: s => <Badge status={STATUS_BADGE[s] || 'default'} text={s} />,
    },
    {
      title: 'Detected', dataIndex: 'detectedAt', key: 'detectedAt',
      render: d => d ? new Date(d).toLocaleDateString('en-PK') : '—',
      sorter: (a, b) => new Date(a.detectedAt) - new Date(b.detectedAt),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="small" onClick={() => setSelected(record)}>View</Button>
          {record.status === 'pending' && (
            <>
              <Button
                size="small" type="primary"
                icon={<CheckOutlined />}
                style={{ backgroundColor: '#15803d' }}
                onClick={() => handleVerify(record)}
              >
                Verify
              </Button>
              <Button
                size="small" danger icon={<CloseOutlined />}
                onClick={() => { setOverrideTarget(record); setOverrideOpen(true) }}
              >
                Override
              </Button>
            </>
          )}
        </div>
      ),
    },
  ]

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div className="p-8">
      <div className="mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#15803d' }}>Diagnosis Reports</h1>
          <p style={{ color: subColor }}>Review, verify or override AI disease predictions</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchReports} loading={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-xl p-6 shadow-sm border" style={{ background: cardBg, borderColor: dark ? '#2d3748' : 'rgba(21,128,61,0.08)' }}>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={reports}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No diagnosis reports yet' }}
          />
        </Spin>
      </div>

      {/* ── Detail modal ── */}
      <Modal
        title="Disease Report Detail"
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={
          selected?.status === 'pending' ? (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button
                type="primary"
                style={{ backgroundColor: '#15803d' }}
                icon={<CheckOutlined />}
                onClick={() => handleVerify(selected)}
              >
                Verify AI Prediction
              </Button>
              <Button
                danger icon={<CloseOutlined />}
                onClick={() => { setOverrideTarget(selected); setOverrideOpen(true) }}
              >
                Override
              </Button>
            </div>
          ) : null
        }
      >
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div><b>Farmer:</b> {selected.farmer} ({selected.phone})</div>
            <div><b>Crop:</b> {selected.crop}</div>
            <div><b>AI Prediction:</b> {selected.prediction}</div>
            <div><b>Confidence:</b> <Tag color={CONF_COLOR(selected.confidence)}>{FMT_CONF(selected.confidence)}</Tag></div>
            <div><b>Treatment (AI):</b> {selected.treatment || '—'}</div>
            <div>
              <b>Status:</b>{' '}
              <Tag color={STATUS_COLOR[selected.status]}>{selected.status}</Tag>
            </div>
            {selected.status !== 'pending' && selected.adminDiagnosis && (
              <>
                <div><b>Admin Diagnosis:</b> {selected.adminDiagnosis}</div>
                <div><b>Admin Treatment:</b> {selected.adminTreatment}</div>
                {selected.adminTreatmentUr && (
                  <div style={{ direction: 'rtl', fontFamily: 'serif', background: urduBoxBg, padding: 8, borderRadius: 6 }}>
                    {selected.adminTreatmentUr}
                  </div>
                )}
              </>
            )}
            {selected.imagePath && (
              <div>
                <b>Image:</b>
                <img
                  src={`http://localhost:5000/uploads/${selected.imagePath.replace('static/uploads/', '')}`}
                  alt="leaf"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                  style={{ width: '100%', borderRadius: 8, marginTop: 8, maxHeight: 240, objectFit: 'contain' }}
                />
                <div style={{
                  display: 'none', marginTop: 8, padding: '12px 16px',
                  background: urduBoxBg, borderRadius: 8, alignItems: 'center', gap: 8,
                  color: subColor, fontSize: 13
                }}>
                  <span>🖼️</span>
                  <span>Image file not found on server — farmer's upload may have been cleared.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Override modal ── */}
      <Modal
        title="Override AI Prediction"
        open={overrideOpen}
        onOk={handleOverrideSubmit}
        confirmLoading={submitting}
        onCancel={() => { setOverrideOpen(false); form.resetFields() }}
        okText="Send to Farmer"
        okButtonProps={{ icon: <SendOutlined />, style: { backgroundColor: '#15803d' } }}
      >
        <p style={{ color: '#6b7280', marginBottom: 16 }}>
          AI predicted: <b>{overrideTarget?.prediction}</b> (
          {FMT_CONF(overrideTarget?.confidence)} confidence). Provide your own diagnosis below.
        </p>
        <Form form={form} layout="vertical">
          <Form.Item name="diagnosis" label="Your Diagnosis" rules={[{ required: true, message: 'Select a diagnosis' }]}>
            <Select placeholder="Select correct disease">
              {DISEASE_OPTIONS.map(d => <Option key={d} value={d}>{d}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="treatment" label="Treatment Instructions" rules={[{ required: true, message: 'Enter treatment' }]}>
            <TextArea rows={3} placeholder="Describe the correct treatment for the farmer..." />
          </Form.Item>
          <Form.Item name="treatmentUr" label="Treatment (Urdu — optional)">
            <TextArea
              rows={3}
              placeholder="اردو میں علاج بتائیں..."
              style={{ direction: 'rtl', fontFamily: 'serif', fontSize: 15 }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Diagnosis