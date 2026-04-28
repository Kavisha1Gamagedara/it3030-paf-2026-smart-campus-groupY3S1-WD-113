import React from 'react'
import { useAuth } from '../auth/AuthContext'
import { Link } from 'react-router-dom'
import LogoutButton from './LogoutButton'

export default function DashboardShell({ title = 'Dashboard', roleLabel = 'User', children }) {
  const { user, profile } = useAuth() || {}
  const displayName =
    (profile && profile.name) ||
    (user && (user.name || [user.given_name, user.family_name].filter(Boolean).join(' '))) ||
    ''
  const displayEmail = (profile && profile.email) || (user && user.email) || ''
  const displayRole = ((profile && profile.role) || roleLabel || '').replace('_', ' ')
  const displayProvider = (profile && profile.provider) || ''
  const displayPicture = (profile && profile.picture) || (user && user.picture) || ''
  const updatedAtRaw = profile && profile.updatedAt
  const updatedAt = updatedAtRaw ? new Date(updatedAtRaw).toLocaleString() : ''
  const headerTitle = displayName || displayEmail
  return (
    <main className="dashboard">
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">SC</div>
            <span className="brand-name">SmartCampus LMS</span>
          </div>

          <div className="sidebar-section">
            <p className="section-title">Navigation</p>
            {(() => {
              const roleValue = (profile && profile.role) || roleLabel || ''
              const roleUpper = roleValue && roleValue.toString().toUpperCase()
              const isUserOrAdmin = roleUpper === 'USER' || roleUpper === 'ADMIN'
              if (isUserOrAdmin) {
                return (
                  <ul className="nav-list">
                    <li className="nav-item">Available facilities</li>
                    <li className="nav-item">Bookings</li>
                    
                    <li className="nav-item">
                      <Link to="/incidents">Tickets</Link>
                    </li>

                    <li className="nav-item">Notifications</li>
                  </ul>
                )
              }

              return (
                <ul className="nav-list">
                  <li className="nav-item">Overview</li>
                  <li className="nav-item active">Courses</li>
                  <li className="nav-item">Students</li>
                  <li className="nav-item">Faculty</li>
                  <li className="nav-item">Assignments</li>
                  <li className="nav-item">Grades</li>
                  <li className="nav-item">Timetable</li>
                  <li className="nav-item">Library</li>
                </ul>
              )
            })()}
          </div>

          <div className="sidebar-section">
            <p className="section-title">Services</p>
            <ul className="nav-list">
              <li className="nav-item">Analytics</li>
              <li className="nav-item"><Link to="/profile">Settings</Link></li>
            </ul>
          </div>

          <div className="storage-panel">
            <p className="section-title">Term Progress</p>
            <div className="storage-bar">
              <div className="storage-fill" />
            </div>
            <p className="storage-meta">8 of 14 weeks completed</p>
          </div>
        </aside>

        <section className="dashboard-main">
          <header className="dashboard-topbar">
            <div className="top-left">
              <h1 className="page-title">{title}</h1>
              {displayRole && <p className="page-subtitle">Role: {displayRole}</p>}
            </div>

            <nav className="top-nav">
              <button type="button" className="tab active">Overview</button>
              <button type="button" className="tab">Courses</button>
              <button type="button" className="tab">Grades</button>
              <button type="button" className="tab">Calendar</button>
              {/* Tickets button — routes based on role */}
              {(() => {
                const role = (profile && profile.role) ? profile.role.toUpperCase() : ''
                const path =
                  role === 'ADMIN' ? '/admin/incidents' :
                  role === 'TECHNICIAN' ? '/technician/incidents' :
                  '/incidents'
                return (
                  <Link to={path}>
                    <button type="button" className="tab">🎫 Tickets</button>
                  </Link>
                )
              })()}
            </nav>

            <div className="top-actions">
              <input
                className="search-input"
                type="search"
                placeholder="Search courses, students, faculty..."
                aria-label="Search"
              />
              <button type="button" className="icon-button">Alerts</button>
              {headerTitle && <div className="user-chip">{headerTitle}</div>}
            </div>
          </header>

          <section className="dashboard-content">
            {children}
          </section>
        </section>

        <aside className="dashboard-panel">
          <div className="panel-header">
            <div>
              {headerTitle && <h2>{headerTitle}</h2>}
              {displayName && displayEmail && <p className="panel-subtitle">{displayEmail}</p>}
              {!displayName && displayEmail && <p className="panel-subtitle">{displayEmail}</p>}
            </div>
            {displayPicture && (
              <img className="profile-photo" src={displayPicture} alt={headerTitle || 'Profile'} />
            )}
            <LogoutButton className="ghost-button">Logout</LogoutButton>
          </div>

          {(displayRole || displayProvider || updatedAt || displayEmail) && (
            <div className="panel-section">
              <p className="section-title">Account</p>
              <ul className="activity-list">
                {displayRole && <li>Role: {displayRole}</li>}
                {displayProvider && <li>Provider: {displayProvider}</li>}
                {displayEmail && !displayName && <li>Email: {displayEmail}</li>}
                {updatedAt && <li>Updated: {updatedAt}</li>}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
