import React from 'react'
import LogoutButton from '../components/LogoutButton'

export default function DashboardUser() {
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>User Dashboard</h1>
        <p className="helper">Welcome — this is the standard user view.</p>
        <div style={{ marginTop: 16 }}>
          <LogoutButton className="btn btn-outline">Logout</LogoutButton>
        </div>
      </div>
    </main>
  )
}
