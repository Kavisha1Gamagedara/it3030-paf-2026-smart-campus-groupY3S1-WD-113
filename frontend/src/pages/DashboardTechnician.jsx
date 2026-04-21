import React from 'react'
import LogoutButton from '../components/LogoutButton'

export default function DashboardTechnician() {
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Technician Dashboard</h1>
        <p className="helper">Maintenance and facility tickets are managed here.</p>
        <div style={{ marginTop: 16 }}>
          <LogoutButton className="btn btn-outline">Logout</LogoutButton>
        </div>
      </div>
    </main>
  )
}
