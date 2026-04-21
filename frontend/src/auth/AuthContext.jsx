import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
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
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, reload: load, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
