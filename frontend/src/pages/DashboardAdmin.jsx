import React, { useEffect, useMemo, useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import AdminResourcesPanel from '../components/AdminResourcesPanel'
import AdminBookingsPanel from '../components/AdminBookingsPanel'
import { useAuth } from '../auth/AuthContext'

const ROLE_OPTIONS = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'STUDENT', 'USER']

const formatDateTime = (iso) => {
  if (!iso) return '-'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString()
  } catch (e) {
    return iso
  }
}

export default function DashboardAdmin() {
  const { user, profile, loading: authLoading } = useAuth() || {}
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editId, setEditId] = useState('')
  const [editForm, setEditForm] = useState({})
  const [savingId, setSavingId] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [activeTab, setActiveTab] = useState('USERS')

  const usersCount = useMemo(() => users.length, [users])
  const isAuthenticated = !!(user && (user.sub || user.id))
  const roleValue = (profile && profile.role) || ''
  const isAdmin = roleValue.toUpperCase() === 'ADMIN'

  const loadUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/admin/api/users', { credentials: 'include' })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to load users')
      }
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated || !isAdmin) {
      setLoading(false)
      return
    }
    loadUsers()
  }, [authLoading, isAuthenticated, isAdmin])

  const startEdit = (user) => {
    setEditId(user.id)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'USER',
      picture: user.picture || ''
    })
  }

  const cancelEdit = () => {
    setEditId('')
    setEditForm({})
  }

  const updateEditField = (key) => (event) => {
    const value = event.target.value
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveUser = async (userId) => {
    setSavingId(userId)
    setError('')
    try {
      const res = await fetch(`/admin/api/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to update user')
      }
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)))
      cancelEdit()
    } catch (err) {
      setError(err.message || 'Failed to update user')
    } finally {
      setSavingId('')
    }
  }

  const deleteUser = async (userId) => {
    const ok = window.confirm('Delete this user? This cannot be undone.')
    if (!ok) return
    setDeletingId(userId)
    setError('')
    try {
      const res = await fetch(`/admin/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!res.ok && res.status !== 204) {
        const msg = await res.text()
        throw new Error(msg || 'Failed to delete user')
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      if (editId === userId) cancelEdit()
    } catch (err) {
      setError(err.message || 'Failed to delete user')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <DashboardShell 
      title="Admin Dashboard" 
      roleLabel="Admin"
      activeTab={activeTab === 'USERS' ? 'USERS' : activeTab}
      onTabChange={setActiveTab}
    >
      {activeTab === 'USERS' && (
        <section className="file-table-section">
          <div className="section-header">
            <div>
              <p className="breadcrumbs">Administration</p>
              <h2 style={{ margin: 0 }}>User Management</h2>
              <p className="helper">Manage registered users, update roles, or remove access.</p>
            </div>
            <div className="table-actions">
              <span className="badge">{usersCount} users</span>
              <button type="button" className="btn btn-outline" onClick={loadUsers} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {!authLoading && !isAuthenticated && (
            <p className="status-warn" style={{ marginTop: 0 }}>
              Sign in as admin to load users.
            </p>
          )}

          {!authLoading && isAuthenticated && !isAdmin && (
            <p className="status-warn" style={{ marginTop: 0 }}>
              Your account does not have ADMIN access yet. Update your role and sign in again.
            </p>
          )}

          {error && <p className="status-warn" style={{ marginTop: 0 }}>{error}</p>}

          {loading && !usersCount && isAuthenticated && isAdmin && <p className="helper">Loading users...</p>}

          {!loading && !usersCount && !error && (
            <p className="helper">No users found yet.</p>
          )}

          {!!usersCount && (
            <table className="file-table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Provider</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isEditing = editId === user.id
                  return (
                    <tr key={user.id}>
                      <td>
                        {isEditing ? (
                          <input
                            className="inline-input"
                            value={editForm.name}
                            onChange={updateEditField('name')}
                            placeholder="Name"
                          />
                        ) : (
                          user.name || '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            className="inline-input"
                            value={editForm.email}
                            onChange={updateEditField('email')}
                            placeholder="Email"
                          />
                        ) : (
                          user.email || '-'
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select className="inline-input" value={editForm.role} onChange={updateEditField('role')}>
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role} value={role}>{role.replace('_', ' ')}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="badge">{(user.role || 'USER').replace('_', ' ')}</span>
                        )}
                      </td>
                      <td>{user.provider || '-'}</td>
                      <td>{formatDateTime(user.updatedAt)}</td>
                      <td>
                        <div className="table-actions">
                          {!isEditing && (
                            <button type="button" className="btn btn-outline" onClick={() => startEdit(user)}>
                              Edit
                            </button>
                          )}
                          {isEditing && (
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => saveUser(user.id)}
                              disabled={savingId === user.id}
                            >
                              {savingId === user.id ? 'Saving...' : 'Save'}
                            </button>
                          )}
                          {isEditing && (
                            <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                              Cancel
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => deleteUser(user.id)}
                            disabled={deletingId === user.id}
                          >
                            {deletingId === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      )}
      {isAuthenticated && isAdmin && activeTab === 'RESOURCES' && <AdminResourcesPanel />}
      {isAuthenticated && isAdmin && activeTab === 'BOOKINGS_ADMIN' && <AdminBookingsPanel />}
    </DashboardShell>
  )
}
