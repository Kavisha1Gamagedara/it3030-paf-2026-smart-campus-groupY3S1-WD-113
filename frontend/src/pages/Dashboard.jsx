import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const loggedIn = user && user.sub

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
            {profile && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ marginTop: 0 }}>MongoDB Profile</h4>
                <p className="helper">Name: {profile.name || '-'}</p>
                <p className="helper">Email: {profile.email || '-'}</p>
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
