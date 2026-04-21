import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function DashboardAdmin() {
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
        <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>
        <p className="helper">Administrative tools and user management go here.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/dashboard"><button className="btn">Back to Dashboard</button></Link>
          <button className="btn btn-outline" style={{ marginLeft: 12 }} onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </main>
  )
}
