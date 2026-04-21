import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingRole, setUpdatingRole] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userRes = await fetch('http://localhost:8080/api/user', { credentials: 'include' })
        const userJson = await userRes.json()
        setUser(userJson)

        if (userJson && userJson.sub) {
          const profileRes = await fetch('http://localhost:8080/api/user/profile', { credentials: 'include' })
          if (profileRes.ok) {
            const profileJson = await profileRes.json()
            setProfile(profileJson)
          }
        }
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  useEffect(() => {
    const syncRole = async () => {
      if (loading || !user || !user.sub || updatingRole) {
        return
      }

      const storedRole = localStorage.getItem('smartCampusRole')
      if (!storedRole || storedRole === (profile && profile.role)) {
        return
      }

      try {
        setUpdatingRole(true)
        const res = await fetch('http://localhost:8080/api/user/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ role: storedRole })
        })

        if (res.ok) {
          const updated = await res.json()
          setProfile(updated)
        }
      } finally {
        setUpdatingRole(false)
      }
    }

    syncRole()
  }, [loading, user, profile, updatingRole])
  const loggedIn = user && user.sub

  useEffect(() => {
    // dispatch to role-specific dashboard when logged in
    const dispatch = () => {
      const role = (profile && profile.role) || localStorage.getItem('smartCampusRole') || 'USER'
      const route = `/dashboard/${role.toLowerCase()}`
      navigate(route, { replace: true })
    }

    if (!loading && loggedIn) {
      dispatch()
    }
  }, [loading, loggedIn, profile, navigate])

  const displayRole = (profile && profile.role) || localStorage.getItem('smartCampusRole') || 'USER'

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } finally {
      setUser(null)
      setProfile(null)
      window.location.href = '/login'
    }
  }

  if (loading) {
    return (
      <main className="page">
        <div className="login-card">
          <h1 style={{ marginTop: 0 }}>Dashboard</h1>
          <p className="helper">Loading your profile...</p>
        </div>
      </main>
    )
  }
  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Dashboard</h1>
        {!loggedIn && (
          <div>
            <p className="status-warn">You are not signed in.</p>
            <Link to="/login"><button className="btn btn-primary">Go to Login</button></Link>
          </div>
        )}

        {loggedIn && (
          <div>
            <p className="status-ok">Signed in as {user.name || user.email}</p>
            <div className="role-row" style={{ marginTop: 12 }}>
              <span className="helper">Role: {displayRole.replace('_', ' ')}</span>
              <button type="button" className="btn btn-outline" onClick={handleLogout}>
                Logout
              </button>
            </div>
            {profile && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ marginTop: 0 }}>MongoDB Profile</h4>
                <p className="helper">Name: {profile.name || '-'}</p>
                <p className="helper">Email: {profile.email || '-'}</p>
                <p className="helper">Role: {profile.role || '-'}</p>
                <p className="helper">Provider: {profile.provider || '-'}</p>
                <p className="helper">Updated: {profile.updatedAt || '-'}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
