import React, { useEffect, useState } from 'react'
import { getMyNotifications, markAsRead, markAllAsRead } from '../api/notificationApi'
import { Link } from 'react-router-dom'

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadNotifications = async () => {
    try {
      const data = await getMyNotifications()
      setNotifications(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && notifications.length === 0) return <p className="helper">Loading notifications...</p>

  return (
    <div className="notification-panel fade-in">
      <div className="section-header" style={{ marginBottom: '12px' }}>
        <p className="section-title">Notifications</p>
        {notifications.some(n => !n.read) && (
          <button className="btn-link" style={{ fontSize: '11px' }} onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="helper" style={{ textAlign: 'center', padding: '20px 0' }}>No notifications yet.</p>
      ) : (
        <ul className="activity-list">
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`activity-item ${notification.read ? 'read' : 'unread'}`}
              style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                marginBottom: '8px',
                background: notification.read ? 'transparent' : 'var(--bg-accent)',
                border: notification.read ? '1px solid var(--border)' : '1px solid var(--primary-light)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text)' }}>
                  {notification.title}
                </span>
                {!notification.read && (
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: 'var(--primary)',
                    display: 'inline-block'
                  }} />
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '4px 0' }}>
                {notification.message}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted-more)' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
                {notification.referenceId && (
                  <Link 
                    to={notification.type === 'BOOKING' ? '/bookings' : `/incidents/${notification.referenceId}`}
                    style={{ fontSize: '10px', fontWeight: '600', color: 'var(--primary)' }}
                  >
                    View Details
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
