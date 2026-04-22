import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    // If a local admin session was created, restore it from localStorage
    const localAdmin = localStorage.getItem('smartCampusLocalAdmin') === '1'
    if (localAdmin) {
      const uname = localStorage.getItem('smartCampusLocalAdminUser') || 'admin'
      const fakeUser = { name: uname, email: `${uname}@local`, sub: 'local-admin' }
      const fakeProfile = { name: uname, email: `${uname}@local`, role: 'ADMIN', provider: 'local', updatedAt: new Date().toISOString() }
      setUser(fakeUser)
      setProfile(fakeProfile)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('http://localhost:8080/api/user', { credentials: 'include' })
      const userJson = await res.json()
      setUser(userJson && Object.keys(userJson).length ? userJson : null)

      if (userJson && (userJson.sub || userJson.id)) {
        const profileRes = await fetch('http://localhost:8080/api/user/profile', { credentials: 'include' })
        if (profileRes.ok) {
          const p = await profileRes.json()
          setProfile(p)
        } else {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    } catch (e) {
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const logout = async () => {
    try {
      await fetch('http://localhost:8080/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('smartCampusRole')
    // clear possible local-admin session
    localStorage.removeItem('smartCampusLocalAdmin')
    localStorage.removeItem('smartCampusLocalAdminUser')
    setUser(null)
    setProfile(null)
  }

  const loginLocal = async (username, password, role = 'ADMIN') => {
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME || 'admin'
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    if (username === adminUser && password === adminPass) {
      // persist simple local admin session
      localStorage.setItem('smartCampusLocalAdmin', '1')
      localStorage.setItem('smartCampusLocalAdminUser', username)
      const fakeUser = { name: username, email: `${username}@local`, sub: 'local-admin' }
      const fakeProfile = { name: username, email: `${username}@local`, role, provider: 'local', updatedAt: new Date().toISOString() }
      setUser(fakeUser)
      setProfile(fakeProfile)
      return { ok: true }
    }
    return { ok: false, message: 'Invalid credentials' }
  }

  const updateProfile = async (updates) => {
    // If local admin, update locally
    const localAdmin = localStorage.getItem('smartCampusLocalAdmin') === '1'
    if (localAdmin) {
      setProfile((p) => ({ ...(p || {}), ...updates, updatedAt: new Date().toISOString() }))
      return { ok: true }
    }

    try {
      const res = await fetch('http://localhost:8080/api/user/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, message: err }
      }
      const updated = await res.json()
      setProfile(updated)
      return { ok: true, profile: updated }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, reload: load, logout, loginLocal, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
