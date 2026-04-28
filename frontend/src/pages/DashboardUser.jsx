import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'

export default function DashboardUser() {
  return (
    <DashboardShell title="User Dashboard" roleLabel="User">
        <UserBookingsPanel />
    </DashboardShell>
  )
}
