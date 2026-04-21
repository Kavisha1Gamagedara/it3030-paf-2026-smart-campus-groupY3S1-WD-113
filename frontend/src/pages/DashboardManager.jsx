import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardManager() {
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
        <h1 style={{ marginTop: 0 }}>Manager Dashboard</h1>
        <p className="helper">Manager tools and reporting are available here.</p>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </main>
  )
}
