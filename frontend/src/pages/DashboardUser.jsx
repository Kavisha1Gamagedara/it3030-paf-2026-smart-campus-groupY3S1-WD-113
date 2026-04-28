import React, { useState } from 'react'
import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'
import MyIncidents from '../components/MyIncidents'

export default function DashboardUser() {
  const [activeTab, setActiveTab] = useState('OVERVIEW')

  return (
    <DashboardShell 
      title="User Dashboard" 
      roleLabel="User"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
        {activeTab === 'OVERVIEW' && (
            <div className="card">
                <h3>Welcome to Smart Campus</h3>
                <p className="helper">Explore facilities and manage your profile from here.</p>
            </div>
        )}
        {activeTab === 'BOOKINGS' && <UserBookingsPanel />}
        {activeTab === 'TICKETS' && <MyIncidents />}
    </DashboardShell>
  )
}
