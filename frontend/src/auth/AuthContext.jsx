import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    let userJson = null
    try {
      const res = await fetch('http://localhost:8080/api/user', { credentials: 'include' })
      userJson = await res.json()
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
    }

    const localAdmin = localStorage.getItem('smartCampusLocalAdmin') === '1'
    if ((!userJson || !Object.keys(userJson || {}).length) && localAdmin) {
      const uname = localStorage.getItem('smartCampusLocalAdminUser') || 'admin'
      const fakeUser = { name: uname, email: `${uname}@local`, sub: 'local-admin' }
      const fakeProfile = { name: uname, email: `${uname}@local`, role: 'ADMIN', provider: 'local', updatedAt: new Date().toISOString() }
      setUser(fakeUser)
      setProfile(fakeProfile)
    }

    setLoading(false)
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
    try {
      const res = await fetch('http://localhost:8080/api/auth/local/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      })
      if (!res.ok) {
        const msg = await res.text()
        return { ok: false, message: msg || 'Invalid credentials' }
      }
      localStorage.setItem('smartCampusLocalAdmin', '1')
      localStorage.setItem('smartCampusLocalAdminUser', username)
      await load()
      return { ok: true }
    } catch (e) {
      return { ok: false, message: e.message || 'Login failed' }
    }
  }

  const updateProfile = async (updates) => {
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

  const deleteProfile = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/user/profile', {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.status === 204) {
        setUser(null)
        setProfile(null)
        localStorage.removeItem('smartCampusRole')
        localStorage.removeItem('smartCampusLocalAdmin')
        localStorage.removeItem('smartCampusLocalAdminUser')
        return { ok: true }
      }
      const errText = await res.text()
      return { ok: false, message: errText }
    } catch (e) {
      return { ok: false, message: e.message }
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, reload: load, logout, loginLocal, updateProfile, deleteProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
