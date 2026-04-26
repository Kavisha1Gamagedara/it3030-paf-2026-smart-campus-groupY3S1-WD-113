import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="page">
      <div className="hero">
        <div>
          <span className="tag">Secure • Fast • Campus-ready</span>
          <h1 className="title">Smart Campus Portal</h1>
          <p className="subtitle">
            Centralize incident reporting, user access, and campus operations in one place.
            Sign in with Google to access dashboards and protected resources.
          </p>
          <div className="cta-row">
            <Link to="/login"><button className="btn btn-primary">Get Started</button></Link>
            <a href="http://localhost:8081/api/auth/status" target="_blank" rel="noreferrer">
              <button className="btn btn-outline">Auth Status</button>
            </a>
          </div>
        </div>
        <div className="hero-card">
          <h3 style={{ marginTop: 0 }}>Quick highlights</h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)' }}>
            <li>Role-ready architecture</li>
            <li>OAuth 2.0 with Google</li>
            <li>Backend status endpoint</li>
            <li>MongoDB connection ready</li>
          </ul>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Incident Management</h4>
          <p className="helper">Capture, track, and resolve issues across campus locations.</p>
        </div>
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Access Control</h4>
          <p className="helper">Prepare role-based routes for admins, staff, and students.</p>
        </div>
        <div className="card">
          <h4 style={{ marginTop: 0 }}>Real-time Status</h4>
          <p className="helper">Check OAuth availability and backend connectivity instantly.</p>
        </div>
      </div>
    </main>
  )
}
