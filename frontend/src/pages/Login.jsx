import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
  const [status, setStatus] = useState({ oauthEnabled: false })
  const [loading, setLoading] = useState(true)
  const auth = useAuth()
  const navigate = useNavigate()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState('USER')

  const roleOptions = ['USER', 'ADMIN', 'STUDENT', 'TECHNICIAN', 'MANAGER']

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' })
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
    if (!loading && auth?.user) {
      navigate('/dashboard', { replace: true })
    }
  }, [loading, auth, navigate])

  const handleGoogleLogin = () => {
    localStorage.setItem('smartCampusRole', selectedRole)
    window.location.href = status.authorizationUrl || '/oauth2/authorization/google'
  }

  const handleLocalLogin = async (e) => {
    e.preventDefault()
    setError('')
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    
    // In this repo, local login is typically for ADMIN but we can support others if auth context allows
    const res = await auth.loginLocal(username, password, selectedRole)
    if (res?.ok) {
      localStorage.setItem('smartCampusRole', selectedRole)
      navigate(`/dashboard/${selectedRole.toLowerCase()}`, { replace: true })
    } else {
      setError(res?.message || 'Invalid credentials')
    }
  }

  if (loading) {
    return <div className="auth-page"><p className="helper">Establishing secure connection...</p></div>
  }

  return (
    <div className="auth-page">
      <div className="login-container">
        <div className="auth-header">
            <div className="sidebar-brand" style={{ padding: 0, justifyContent: 'center', marginBottom: '16px' }}>
                <div className="brand-mark" style={{ background: 'var(--primary-gradient)' }}>SC</div>
                <span className="brand-name" style={{ color: '#0f172a', fontSize: '24px' }}>SmartCampus</span>
            </div>
          <h1>Welcome back</h1>
          <p>Please enter your details to sign in</p>
        </div>

        <form onSubmit={handleLocalLogin}>
          <div className="input-group">
            <label className="input-label">USERNAME</label>
            <input 
              type="text" 
              className="modern-input" 
              placeholder="e.g. john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">PASSWORD</label>
            <input 
              type="password" 
              className="modern-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">LOGIN AS</label>
            <select 
                className="modern-input" 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ appearance: 'none', background: '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center', backgroundSize: '16px' }}
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>{role.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          {error && <p className="status-warn" style={{ marginBottom: '16px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px' }}>
            Sign in
          </button>
        </form>

        <div className="auth-divider">or</div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Log in with Google
        </button>

        <p className="helper" style={{ textAlign: 'center', marginTop: '32px' }}>
          Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Contact your administrator</span>
        </p>
      </div>
    </div>
  )
}
