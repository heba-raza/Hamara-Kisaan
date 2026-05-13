import { useState, useEffect } from 'react'
import { Table, Tag, Button, Modal, Form, Input, Select } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useTheme } from '../context/ThemeContext'

const { Option } = Select
const { TextArea } = Input

const severityColors = {
  High: 'red',
  Medium: 'orange',
  Low: 'green'
}

function Treatment() {
  const { dark } = useTheme()
  const cardBg = dark ? '#1a1f2e' : '#fff'
  const subColor = dark ? '#9ca3af' : '#6b7280'
  const [treatments, setTreatments] = useState([])
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchTreatments()
  }, [])

  const fetchTreatments = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/treatments', {
        credentials: 'include'
      })
      const data = await res.json()

      const formatted = data.map(item => ({
        key: item.id,
        disease: item.disease_name,
        crop: item.crop_type,
        severity: item.severity,
        treatment: item.treatment
      }))

      setTreatments(formatted)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAdd = async () => {
    const values = await form.validateFields()

    await fetch('http://localhost:5000/api/admin/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        disease_name: values.disease,
        crop_type: values.crop,
        severity: values.severity,
        treatment: values.treatment
      })
    })

    form.resetFields()
    setOpen(false)
    fetchTreatments()
  }

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/admin/treatments/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    })

    fetchTreatments()
  }

  const columns = [
    { title: 'Disease', dataIndex: 'disease' },
    { title: 'Crop', dataIndex: 'crop' },
    {
      title: 'Severity',
      dataIndex: 'severity',
      render: s => <Tag color={severityColors[s]}>{s}</Tag>
    },
    {
      title: 'Treatment',
      dataIndex: 'treatment',
      render: t => <span style={{ fontSize: 12 }}>{t}</span>
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Button danger onClick={() => handleDelete(record.key)}>
          Delete
        </Button>
      )
    }
  ]

  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#15803d' }}>Treatment</h1>
          <p style={{ color: subColor }}>Disease treatment recommendations</p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#15803d' }}
          onClick={() => setOpen(true)}
        >
          Add Treatment
        </Button>
      </div>

      <div className="rounded-xl p-6 shadow-sm border" style={{ background: cardBg, borderColor: dark ? '#2d3748' : 'rgba(21,128,61,0.08)' }}>
        <Table
          columns={columns}
          dataSource={treatments}
          pagination={{ pageSize: 6 }}
        />
      </div>

      <Modal
        title="Add Treatment"
        open={open}
        onOk={handleAdd}
        onCancel={() => setOpen(false)}
        okText="Save"
        okButtonProps={{ style: { backgroundColor: '#15803d' } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="disease" label="Disease Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Wheat Rust" />
          </Form.Item>

          <Form.Item name="crop" label="Crop" rules={[{ required: true }]}>
            <Select placeholder="Select crop">
              <Option value="Wheat">Wheat</Option>
              <Option value="Rice">Rice</Option>
              <Option value="Cotton">Cotton</Option>
              <Option value="Sugarcane">Sugarcane</Option>
            </Select>
          </Form.Item>

          <Form.Item name="severity" label="Severity" rules={[{ required: true }]}>
            <Select placeholder="Select severity">
              <Option value="High">High</Option>
              <Option value="Medium">Medium</Option>
              <Option value="Low">Low</Option>
            </Select>
          </Form.Item>

          <Form.Item name="treatment" label="Treatment Instructions" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="Describe the treatment..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Treatment