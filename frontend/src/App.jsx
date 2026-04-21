import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DashboardAdmin from './pages/DashboardAdmin'
import DashboardUser from './pages/DashboardUser'
import DashboardStudent from './pages/DashboardStudent'
import DashboardTechnician from './pages/DashboardTechnician'
import DashboardManager from './pages/DashboardManager'

export default function App() {
  return (
    <BrowserRouter>
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="badge">Smart Campus</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/user" element={<DashboardUser />} />
        <Route path="/dashboard/student" element={<DashboardStudent />} />
        <Route path="/dashboard/technician" element={<DashboardTechnician />} />
        <Route path="/dashboard/manager" element={<DashboardManager />} />
      </Routes>
    </BrowserRouter>
  )
}
