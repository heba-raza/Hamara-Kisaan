import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Farmers from './pages/Farmers'
import Crops from './pages/Crops'
import Treatment from './pages/Treatment'
import Diagnosis from './pages/Diagnosis'
import Weather from './pages/Weather'
import Advisories from './pages/Advisories'
import ActivityLog from './pages/ActivityLog'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<Login />} />
        <Route path="/dashboard"   element={<Layout><Dashboard /></Layout>} />
        <Route path="/farmers"     element={<Layout><Farmers /></Layout>} />
        <Route path="/crops"       element={<Layout><Crops /></Layout>} />
        <Route path="/treatment"   element={<Layout><Treatment /></Layout>} />
        <Route path="/diagnosis"   element={<Layout><Diagnosis /></Layout>} />
        <Route path="/weather"     element={<Layout><Weather /></Layout>} />
        <Route path="/advisories"  element={<Layout><Advisories /></Layout>} />
        <Route path="/activity"    element={<Layout><ActivityLog /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App