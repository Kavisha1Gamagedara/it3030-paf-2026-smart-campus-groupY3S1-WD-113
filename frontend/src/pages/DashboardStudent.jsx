import React, { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'

export default function DashboardStudent() {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  return (
    <DashboardShell 
      title="Student Dashboard" 
      roleLabel="Student"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {activeTab === 'OVERVIEW' && (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <div className="card">
                    <h3>My Courses</h3>
                    <p className="helper">You have 5 active courses this semester.</p>
                </div>
                <div className="card">
                    <h3>Assignments</h3>
                    <p className="helper">3 assignments due this week.</p>
                </div>
            </div>
        )}
        {activeTab === 'BOOKINGS' && <UserBookingsPanel />}
    </DashboardShell>
  )
}
