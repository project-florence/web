import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/[0.03] -z-10" />
      <Sidebar />
      <div className="flex-1 ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
