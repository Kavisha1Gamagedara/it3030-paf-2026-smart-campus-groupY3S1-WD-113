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
import { AuthProvider, useAuth } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'

export default function App() {
  const Nav = () => {
    const auth = useAuth()
    return (
      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="badge">Smart Campus</Link>
          <div className="nav-links">
            <Link to="/">Home</Link>
            {!auth?.user && <Link to="/login">Login</Link>}
            <Link to="/dashboard">Dashboard</Link>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/admin" element={<RequireAuth><DashboardAdmin /></RequireAuth>} />
          <Route path="/dashboard/user" element={<RequireAuth><DashboardUser /></RequireAuth>} />
          <Route path="/dashboard/student" element={<RequireAuth><DashboardStudent /></RequireAuth>} />
          <Route path="/dashboard/technician" element={<RequireAuth><DashboardTechnician /></RequireAuth>} />
          <Route path="/dashboard/manager" element={<RequireAuth><DashboardManager /></RequireAuth>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
