import React, { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Profile() {
  const { user, profile, loading, updateProfile } = useAuth() || {}
  const [form, setForm] = useState({})
  const [status, setStatus] = useState({})

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', email: profile.email || '', picture: profile.picture || '' })
  }, [profile])

  if (loading) return <div className="page"><div className="login-card"><h1>Loading...</h1></div></div>

  const handleChange = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ saving: true })
    const res = await updateProfile(form)
    if (res && res.ok) {
      setStatus({ saved: true })
      setTimeout(() => setStatus({}), 2000)
    } else {
      setStatus({ error: (res && res.message) || 'Failed to save' })
    }
  }

  return (
    <main className="page">
      <div className="login-card">
        <h1 style={{ marginTop: 0 }}>Profile</h1>
        <p className="helper">View and update your account details.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Name
            <input value={form.name || ''} onChange={handleChange('name')} className="search-input" />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Email
            <input value={form.email || ''} onChange={handleChange('email')} className="search-input" />
          </label>

          <label style={{ display: 'block', marginBottom: 8 }}>
            Picture URL
            <input value={form.picture || ''} onChange={handleChange('picture')} className="search-input" />
          </label>

          <div style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">Save</button>
            {status.saving && <span style={{ marginLeft: 8 }}>Saving...</span>}
            {status.saved && <span style={{ marginLeft: 8, color: 'green' }}>Saved</span>}
            {status.error && <span style={{ marginLeft: 8, color: 'red' }}>{status.error}</span>}
          </div>
        </form>
      </div>
    </main>
  )
}
