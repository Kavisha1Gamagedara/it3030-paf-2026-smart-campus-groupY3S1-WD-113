import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function LogoutButton({ className = 'btn btn-outline', children }) {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (auth && auth.logout) {
        await auth.logout()
      }
    } catch (e) {
      // ignore
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout}>
      {children || 'Logout'}
    </button>
  )
}
