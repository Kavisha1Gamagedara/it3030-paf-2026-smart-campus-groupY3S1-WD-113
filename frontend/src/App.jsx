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
import Profile from './pages/Profile'
import Resources from './pages/Resources'
import { AuthProvider, useAuth } from './auth/AuthContext'
import RequireAuth from './auth/RequireAuth'
import MyIncidents from './pages/incidents/MyIncidents'
import CreateIncident from './pages/incidents/CreateIncident'
import IncidentDetails from './pages/incidents/IncidentDetails'
import AdminIncidents from './pages/incidents/AdminIncidents'
import TechnicianIncidents from './pages/incidents/TechnicianIncidents'

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
            <Link to="/resources">Resources</Link>
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
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/incidents" element={<MyIncidents />} />
          <Route path="/incidents/new" element={<CreateIncident />} />
          <Route path="/incidents/:id" element={<IncidentDetails />} />
          {/* Admin incident routes */}
          <Route path="/admin/incidents" element={<RequireAuth><AdminIncidents /></RequireAuth>} />

          {/* Technician incident routes */}
          <Route path="/technician/incidents" element={<RequireAuth><TechnicianIncidents /></RequireAuth>} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
