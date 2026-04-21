import React, { useEffect, useState } from 'react'

export default function Login() {
  const [status, setStatus] = useState({ oauthEnabled: false })
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState('USER')

  const roleOptions = status.roles || ['USER', 'ADMIN', 'STUDENT', 'TECHNICIAN', 'MANAGER']

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

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
  }

  const handleLogin = () => {
    localStorage.setItem('smartCampusRole', selectedRole)
    const target = `http://localhost:8080${status.authorizationUrl || '/oauth2/authorization/google'}`
    window.location.href = target
  }

  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Welcome back</h1>
        <p className="helper">Sign in to access the Smart Campus dashboard.</p>

        {status.oauthEnabled ? (
          <div>
            <p className="status-ok">OAuth is enabled</p>
            <div className="role-grid" style={{ marginTop: 12 }}>
              {roleOptions.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-chip ${selectedRole === role ? 'active' : ''}`}
                  onClick={() => handleRoleSelect(role)}
                >
                  {role.replace('_', ' ')}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleLogin}>
              Continue as {selectedRole.replace('_', ' ')}
            </button>
            <p className="helper" style={{ marginTop: 12 }}>
              You will sign in with Google and land in the {selectedRole.replace('_', ' ').toLowerCase()} dashboard.
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
