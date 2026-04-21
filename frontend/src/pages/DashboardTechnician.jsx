import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardTechnician() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      localStorage.removeItem('smartCampusRole')
      navigate('/login', { replace: true })
    }
  }

  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Technician Dashboard</h1>
        <p className="helper">Maintenance and facility tickets are managed here.</p>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </main>
  )
}
