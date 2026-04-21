import React from 'react'
import LogoutButton from '../components/LogoutButton'

export default function DashboardManager() {
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Manager Dashboard</h1>
        <p className="helper">Manager tools and reporting are available here.</p>
        <div style={{ marginTop: 16 }}>
          <LogoutButton className="btn btn-outline">Logout</LogoutButton>
        </div>
      </div>
    </main>
  )
}
