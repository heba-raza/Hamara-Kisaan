import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { useTheme } from '../context/ThemeContext'

function Crops() {
  const { dark } = useTheme()
  const cardBg = dark ? '#1a1f2e' : '#fff'
  const subColor = dark ? '#9ca3af' : '#6b7280'
  const [crops, setCrops] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/crops', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((item, index) => ({
          key: index,
          crop: item.crop_type,
          farmers: item.farmer_count,
          avg_acres: Number(item.avg_acres || 0).toFixed(2),
          total_acres: item.total_acres || 0
        }))
        setCrops(formatted)
      })
      .catch(err => console.error(err))
  }, [])

  const columns = [
    { title: 'Crop', dataIndex: 'crop' },
    { title: 'Farmers', dataIndex: 'farmers' },
    { title: 'Avg Land (Acres)', dataIndex: 'avg_acres' },
    { title: 'Total Land (Acres)', dataIndex: 'total_acres' }
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: '#15803d' }}>Crops Overview</h1>
        <p style={{ color: subColor }}>Live crop distribution based on registered farmers</p>
      </div>

      <div className="rounded-xl p-6 shadow-sm border" style={{ background: cardBg, borderColor: dark ? '#2d3748' : 'rgba(21,128,61,0.08)' }}>
        <Table
          columns={columns}
          dataSource={crops}
          pagination={{ pageSize: 6 }}
        />
      </div>
    </div>
  )
}

export default Crops