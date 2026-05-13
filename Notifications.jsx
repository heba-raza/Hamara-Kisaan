import { useState } from 'react'
import { Form, Input, Button, Select, Table, Tag, message, Card } from 'antd'
import { BellOutlined, SendOutlined, FilterOutlined } from '@ant-design/icons'

const { TextArea } = Input
const { Option } = Select

const allFarmers = [
  { key: 1, name: 'Ahmed Ali',      crop: 'Wheat',  soil: 'Loamy',  district: 'Faisalabad' },
  { key: 2, name: 'Tariq Mahmood',  crop: 'Rice',   soil: 'Clayey', district: 'Faisalabad' },
  { key: 3, name: 'Nasir Hussain',  crop: 'Wheat',  soil: 'Sandy',  district: 'Faisalabad' },
  { key: 4, name: 'Zafar Iqbal',    crop: 'Rice',   soil: 'Loamy',  district: 'Faisalabad' },
  { key: 5, name: 'Bilal Chaudhry', crop: 'Cotton', soil: 'Clayey', district: 'Faisalabad' },
]

const notifTemplates = [
  { label: 'Heatwave Alert',     en: 'Heatwave Warning!',         body_en: 'Extreme heat expected tomorrow. Water crops early morning.', ur: 'گرمی کی لہر!', body_ur: 'کل شدید گرمی متوقع ہے۔ فصل کو صبح سویرے پانی دیں۔' },
  { label: 'Rain Warning',       en: 'Heavy Rain Expected',        body_en: 'Ensure drainage in fields. Delay sowing if planned.', ur: 'بھاری بارش متوقع', body_ur: 'کھیتوں میں نکاسی کا اہتمام کریں۔ بوائی ملتوی کریں۔' },
  { label: 'Crop Tip',           en: 'Crop Advisory',              body_en: 'Apply urea fertilizer to wheat this week for best yield.', ur: 'فصل مشورہ', body_ur: 'بہترین پیداوار کے لیے اس ہفتے گندم کو یوریا کھاد دیں۔' },
  { label: 'Market Price Update',en: 'Market Update',              body_en: 'Wheat price: PKR 3,900/40kg. Sell now for best rate.', ur: 'منڈی اپ ڈیٹ', body_ur: 'گندم قیمت: 3,900 روپے/40 کلو۔ ابھی فروخت کریں۔' },
]

function Notifications() {
  const [form]     = Form.useForm()
  const [filters, setFilters] = useState({})
  const [selected, setSelected] = useState([])
  const [sent, setSent]     = useState([])

  const filtered = allFarmers.filter(f => {
    if (filters.crop && f.crop !== filters.crop) return false
    if (filters.soil && f.soil !== filters.soil) return false
    return true
  })

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Crop', dataIndex: 'crop', key: 'crop' },
    { title: 'Soil', dataIndex: 'soil', key: 'soil' },
  ]

  const handleSend = () => {
    form.validateFields().then(values => {
      if (selected.length === 0) {
        message.warning('Select at least one farmer')
        return
      }
      setSent([{
        id: Date.now(),
        title: values.titleEn,
        recipients: selected.length,
        time: new Date().toLocaleTimeString(),
      }, ...sent])
      form.resetFields()
      setSelected([])
      message.success(`Notification sent to ${selected.length} farmer(s)!`)
    })
  }

  const handleTemplate = (t) => {
    form.setFieldsValue({
      titleEn: t.en, titleUr: t.ur,
      bodyEn: t.body_en, bodyUr: t.body_ur
    })
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-700">
          <BellOutlined style={{ marginRight: 8 }} />
          Push Notifications
        </h1>
        <p className="text-gray-500">Send push notifications — received on farmer mobile app</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* Left — compose */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title="Quick Templates" size="small" className="shadow-sm">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifTemplates.map((t, i) => (
                <Button key={i} size="small" onClick={() => handleTemplate(t)}
                  style={{ textAlign: 'left', height: 'auto', padding: '6px 12px' }}>
                  {t.label}
                </Button>
              ))}
            </div>
          </Card>

          <Card title="Compose Notification" className="shadow-sm">
            <Form form={form} layout="vertical">
              <Form.Item name="titleEn" label="Title (English)" rules={[{ required: true }]}>
                <Input placeholder="e.g. Heatwave Warning!" />
              </Form.Item>
              <Form.Item name="titleUr" label="Title (Urdu)" rules={[{ required: true }]}>
                <Input placeholder="اردو میں عنوان..."
                  style={{ direction: 'rtl', fontFamily: 'serif' }} />
              </Form.Item>
              <Form.Item name="bodyEn" label="Body (English)" rules={[{ required: true }]}>
                <TextArea rows={2} placeholder="Notification body in English..." />
              </Form.Item>
              <Form.Item name="bodyUr" label="Body (Urdu)" rules={[{ required: true }]}>
                <TextArea rows={2} placeholder="اردو میں تفصیل..."
                  style={{ direction: 'rtl', fontFamily: 'serif', fontSize: 15 }} />
              </Form.Item>
              <Button type="primary" icon={<SendOutlined />}
                style={{ backgroundColor: '#15803d' }}
                onClick={handleSend} className="w-full">
                Send to {selected.length} Farmer(s)
              </Button>
            </Form>
          </Card>
        </div>

        {/* Right — recipients */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card title={<><FilterOutlined /> Filter Farmers</>} size="small" className="shadow-sm">
            <div style={{ display: 'flex', gap: 8 }}>
              <Select placeholder="By crop" allowClear style={{ flex: 1 }}
                onChange={v => setFilters(f => ({ ...f, crop: v }))}>
                <Option value="Wheat">Wheat</Option>
                <Option value="Rice">Rice</Option>
                <Option value="Cotton">Cotton</Option>
              </Select>
              <Select placeholder="By soil" allowClear style={{ flex: 1 }}
                onChange={v => setFilters(f => ({ ...f, soil: v }))}>
                <Option value="Loamy">Loamy</Option>
                <Option value="Clayey">Clayey</Option>
                <Option value="Sandy">Sandy</Option>
              </Select>
            </div>
          </Card>

          <Card title="Select Recipients" className="shadow-sm">
            <Table columns={columns} dataSource={filtered} size="small"
              pagination={false}
              rowSelection={{
                selectedRowKeys: selected,
                onChange: keys => setSelected(keys)
              }} />
          </Card>

          {sent.length > 0 && (
            <Card title="Recently Sent" size="small" className="shadow-sm">
              {sent.map(s => (
                <div key={s.id} style={{
                  padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#374151', fontWeight: 600 }}>{s.title}</span>
                    <Tag color="green">Sent</Tag>
                  </div>
                  <div style={{ color: '#9ca3af', marginTop: 2 }}>
                    {s.recipients} farmers · {s.time}
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default Notifications