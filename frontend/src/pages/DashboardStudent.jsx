import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function DashboardStudent() {
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
        <h1 style={{ marginTop: 0 }}>Student Dashboard</h1>
        <p className="helper">Student-specific view: courses, assignments, grades.</p>
        <div style={{ marginTop: 16 }}>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </main>
  )
}
