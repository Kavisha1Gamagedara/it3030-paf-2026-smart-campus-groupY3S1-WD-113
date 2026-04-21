import React, { useEffect, useState } from 'react'

export default function Login() {
  const [status, setStatus] = useState({ oauthEnabled: false })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/status', { credentials: 'include' })
        const json = await res.json()
        setStatus(json)
      } catch (error) {
        setStatus({ oauthEnabled: false, error: 'Backend not reachable' })
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [])

  if (loading) {
    return (
      <main className="page">
        <div className="login-card">
          <h1 style={{ marginTop: 0 }}>Login</h1>
          <p className="helper">Loading authentication status...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Welcome back</h1>
        <p className="helper">Sign in to access the Smart Campus dashboard.</p>

        {status.oauthEnabled ? (
          <div>
            <p className="status-ok">OAuth is enabled</p>
            <a href={`http://localhost:8080${status.authorizationUrl || '/oauth2/authorization/google'}`}>
              <button className="btn btn-primary">Sign in with Google</button>
            </a>
            <p className="helper" style={{ marginTop: 12 }}>
              You will be redirected to your dashboard after authentication.
            </p>
          </div>
        ) : (
          <div>
            <p className="status-warn">OAuth is not configured</p>
            <p className="helper">
              Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in your environment.
            </p>
            {status.error && <p className="helper">{status.error}</p>}
          </div>
        )}
      </div>
    </main>
  )
}
