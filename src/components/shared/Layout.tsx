import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
