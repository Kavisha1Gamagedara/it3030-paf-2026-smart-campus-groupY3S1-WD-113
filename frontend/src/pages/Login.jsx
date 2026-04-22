import React, { useEffect, useState } from 'react'
import { useEffect as useEff, useState as useSt } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const [status, setStatus] = useState({ oauthEnabled: false })
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('USER')

  const roleOptions = status.roles || ['USER', 'ADMIN', 'STUDENT', 'TECHNICIAN', 'MANAGER']
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [adminError, setAdminError] = useState('')

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

  useEffect(() => {
    if (!loading && auth && auth.user) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, auth, navigate])

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

  const handleLocalAdmin = async (e) => {
    e.preventDefault()
    setAdminError('')
    if (!adminUser || !adminPass) {
      setAdminError('Enter username and password')
      return
    }
    if (!auth || !auth.loginLocal) {
      setAdminError('Local login unavailable')
      return
    }
    const res = await auth.loginLocal(adminUser, adminPass, 'ADMIN')
    if (res && res.ok) {
      localStorage.setItem('smartCampusRole', 'ADMIN')
      navigate('/dashboard/admin', { replace: true })
    } else {
      setAdminError(res && res.message ? res.message : 'Login failed')
    }
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
            {/* If ADMIN selected, show local admin form instead of Google */}
            {selectedRole === 'ADMIN' ? (
              <div style={{ marginTop: 12 }}>
                <h3>Local admin login</h3>
                <p className="helper">Enter local admin credentials (development only).</p>
                <form onSubmit={handleLocalAdmin}>
                  <div style={{ marginTop: 8 }}>
                    <input
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="username"
                      className="search-input"
                    />
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <input
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="password"
                      type="password"
                      className="search-input"
                    />
                  </div>
                  {adminError && <p className="status-warn">{adminError}</p>}
                  <div style={{ marginTop: 10 }}>
                    <button type="submit" className="btn btn-primary">Sign in as admin</button>
                  </div>
                </form>
              </div>
            ) : (
              <>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleLogin}>
                  Continue as {selectedRole.replace('_', ' ')}
                </button>
                <p className="helper" style={{ marginTop: 12 }}>
                  You will sign in with Google and land in the {selectedRole.replace('_', ' ').toLowerCase()} dashboard.
                </p>
              </>
            )}
          </div>
        ) : (
          <div>
            <p className="status-warn">OAuth is not configured</p>
            <p className="helper">
              Set <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> in your environment.
            </p>
            {status.error && <p className="helper">{status.error}</p>}
            <hr style={{ margin: '18px 0' }} />
            <h3>Local admin login</h3>
            <p className="helper">Use local admin credentials for development.</p>
            <form onSubmit={handleLocalAdmin}>
              <div style={{ marginTop: 8 }}>
                <input
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  placeholder="username"
                  className="search-input"
                />
              </div>
              <div style={{ marginTop: 8 }}>
                <input
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  placeholder="password"
                  type="password"
                  className="search-input"
                />
              </div>
              {adminError && <p className="status-warn">{adminError}</p>}
              <div style={{ marginTop: 10 }}>
                <button type="submit" className="btn btn-primary">Sign in as admin</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  )
}
