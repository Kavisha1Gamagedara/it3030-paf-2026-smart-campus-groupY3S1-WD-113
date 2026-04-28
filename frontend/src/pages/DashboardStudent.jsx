import DashboardShell from '../components/DashboardShell'
import UserBookingsPanel from '../components/UserBookingsPanel'

export default function DashboardStudent() {
  return (
    <DashboardShell title="Student Dashboard" roleLabel="Student">
        <UserBookingsPanel />
    </DashboardShell>
  )
}
