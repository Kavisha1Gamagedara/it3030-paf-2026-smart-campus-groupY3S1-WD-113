import React from 'react'
import { Link } from 'react-router-dom'
import LogoutButton from '../components/LogoutButton'

export default function DashboardAdmin() {
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>
        <p className="helper">Administrative tools and user management go here.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/dashboard"><button className="btn">Back to Dashboard</button></Link>
          <LogoutButton className="btn btn-outline" style={{ marginLeft: 12 }}>Logout</LogoutButton>
        </div>
      </div>
    </main>
  )
}
