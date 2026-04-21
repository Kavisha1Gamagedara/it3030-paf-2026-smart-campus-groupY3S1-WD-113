import React from 'react'
import LogoutButton from '../components/LogoutButton'

export default function DashboardStudent() {
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Student Dashboard</h1>
        <p className="helper">Student-specific view: courses, assignments, grades.</p>
        <div style={{ marginTop: 16 }}>
          <LogoutButton className="btn btn-outline">Logout</LogoutButton>
        </div>
      </div>
    </main>
  )
}
