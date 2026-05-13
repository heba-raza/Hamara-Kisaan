import { useState, useEffect } from 'react'
import { Table, Input, Tag, Button, Modal, Descriptions, Form, Select, message, Popconfirm } from 'antd'
import { SearchOutlined, EyeOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'
import { farmersAPI } from '../api/config'

const { Option } = Select

const soilColors = { Loamy: 'green', Clayey: 'blue', Sandy: 'orange' }
const cropColors = { Wheat: 'gold', Rice: 'cyan', Cotton: 'purple', Sugarcane: 'green' }

function Farmers() {
  const [farmers, setFarmers]   = useState([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [addOpen, setAddOpen]   = useState(false)
  const [form]                  = Form.useForm()
  const { dark } = useTheme()
  const cardBg   = dark ? '#1a1f2e' : '#fff'

  // ── Fetch farmers from Flask/Aiven ──────────────────────
  const fetchFarmers = async (searchVal = '') => {
    setLoading(true)
    try {
      const data = await farmersAPI.getAll({ search: searchVal, page: 1, limit: 100 })
      const rows = data.farmers.map(f => ({ ...f, key: f.id }))
      setFarmers(rows)
      setTotal(data.total)
    } catch (err) {
      message.error('Failed to load farmers: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchFarmers() }, [])

  // Search with small debounce
  useEffect(() => {
    const timer = setTimeout(() => fetchFarmers(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  // ── Delete farmer ────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await farmersAPI.delete(id)
      message.success('Farmer removed')
      fetchFarmers(search)
    } catch (err) {
      message.error('Delete failed: ' + err.message)
    }
  }

  // ── Add farmer (calls Flask /register route) ─────────────
  const handleAdd = async () => {
    try {
      const values = await form.validateFields()

      const formData = new FormData()
      Object.entries(values).forEach(([k, v]) => formData.append(k, v))
      // email and username may be optional in your register route
      if (!values.email) formData.set('email', '')

      const res = await fetch('http://localhost:5000/register', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (res.ok || res.redirected) {
        message.success('Farmer added successfully!')
        form.resetFields()
        setAddOpen(false)
        fetchFarmers(search)
      } else {
        const text = await res.text()
        message.error(text || 'Failed to add farmer')
      }
    } catch (err) {
      message.error('Error: ' + err.message)
    }
  }

  const columns = [
    { title: 'Full Name',    dataIndex: 'full_name',  key: 'full_name' },
    { title: 'Phone',        dataIndex: 'phone',      key: 'phone' },
    { title: 'CNIC',         dataIndex: 'cnic',       key: 'cnic' },
    { title: 'Tehsil',       dataIndex: 'tehsil',     key: 'tehsil' },
    { title: 'Land (acres)', dataIndex: 'land_acres', key: 'land_acres' },
    { title: 'Soil', dataIndex: 'soil_type', key: 'soil_type',
      render: s => <Tag color={soilColors[s] || 'default'}>{s}</Tag> },
    { title: 'Crop', dataIndex: 'crop_type', key: 'crop_type',
      render: c => <Tag color={cropColors[c] || 'default'}>{c}</Tag> },
    { title: 'Irrigation', dataIndex: 'irrigation', key: 'irrigation' },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="small" icon={<EyeOutlined />}
            onClick={() => setSelected(record)}>
            View
          </Button>
          <Popconfirm
            title="Remove this farmer?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes" cancelText="No"
            okButtonProps={{ danger: true }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      )
    }
  ]

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: 0 }}>Farmers</h1>
          <p style={{ color: dark ? '#9ca3af' : '#6b7280', margin: '4px 0 0' }}>
            All registered farmers — {total} total
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}
          style={{ backgroundColor: '#15803d' }}
          onClick={() => setAddOpen(true)}>
          Add Farmer
        </Button>
      </div>

      <div style={{ background: cardBg, borderRadius: 12, padding: 24 }}>
        <Input
          placeholder="Search by name, crop, soil or tehsil..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 340, marginBottom: 16 }}
          allowClear
        />
        <Table
          columns={columns}
          dataSource={farmers}
          loading={loading}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* View detail modal */}
      <Modal title={selected?.full_name}
        open={!!selected} onCancel={() => setSelected(null)} footer={null} width={600}>
        {selected && (
          <Descriptions column={2} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Full Name">{selected.full_name}</Descriptions.Item>
            <Descriptions.Item label="Username">{selected.username}</Descriptions.Item>
            <Descriptions.Item label="CNIC">{selected.cnic}</Descriptions.Item>
            <Descriptions.Item label="Phone">{selected.phone}</Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>{selected.email}</Descriptions.Item>
            <Descriptions.Item label="Tehsil">{selected.tehsil}</Descriptions.Item>
            <Descriptions.Item label="Land">{selected.land_acres} acres</Descriptions.Item>
            <Descriptions.Item label="Soil Type">{selected.soil_type}</Descriptions.Item>
            <Descriptions.Item label="Crop Type">{selected.crop_type}</Descriptions.Item>
            <Descriptions.Item label="Irrigation">{selected.irrigation}</Descriptions.Item>
            <Descriptions.Item label="Registered">{selected.created_at}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Add farmer modal */}
      <Modal title="Add New Farmer" open={addOpen} onOk={handleAdd}
        onCancel={() => { setAddOpen(false); form.resetFields() }}
        okText="Add Farmer" width={620}
        okButtonProps={{ style: { backgroundColor: '#15803d' } }}>
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <Form.Item name="full_name" label="Full Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Ahmed Ali" />
            </Form.Item>
            <Form.Item name="username" label="Username" rules={[{ required: true }]}>
              <Input placeholder="e.g. ahmed_ali" />
            </Form.Item>
            <Form.Item name="cnic" label="CNIC" rules={[{ required: true }]}>
              <Input placeholder="e.g. 33100-1234567-1" />
            </Form.Item>
            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
              <Input placeholder="e.g. 0301-1234567" />
            </Form.Item>
            <Form.Item name="email" label="Email">
              <Input placeholder="e.g. farmer@gmail.com" />
            </Form.Item>
            <Form.Item name="tehsil" label="Tehsil" rules={[{ required: true }]}>
              <Select placeholder="Select tehsil">
                <Option value="Sammundri">Sammundri</Option>
                <Option value="Jaranwala">Jaranwala</Option>
                <Option value="Tandlianwala">Tandlianwala</Option>
                <Option value="Faisalabad City">Faisalabad City</Option>
              </Select>
            </Form.Item>
            <Form.Item name="land_acres" label="Land (acres)" rules={[{ required: true }]}>
              <Input type="number" placeholder="e.g. 5.5" />
            </Form.Item>
            <Form.Item name="soil_type" label="Soil Type" rules={[{ required: true }]}>
              <Select placeholder="Select soil type">
                <Option value="Loamy">Loamy</Option>
                <Option value="Clayey">Clayey</Option>
                <Option value="Sandy">Sandy</Option>
              </Select>
            </Form.Item>
            <Form.Item name="crop_type" label="Crop Type" rules={[{ required: true }]}>
              <Select placeholder="Select crop">
                <Option value="Wheat">Wheat</Option>
                <Option value="Rice">Rice</Option>
                <Option value="Cotton">Cotton</Option>
                <Option value="Sugarcane">Sugarcane</Option>
              </Select>
            </Form.Item>
            <Form.Item name="irrigation" label="Irrigation Method" rules={[{ required: true }]}>
              <Select placeholder="Select method">
                <Option value="Canal">Canal</Option>
                <Option value="Tubewell">Tubewell</Option>
                <Option value="Rain">Rain</Option>
                <Option value="Drip">Drip</Option>
              </Select>
            </Form.Item>
            <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
              <Input.Password placeholder="Set initial password" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default Farmers
