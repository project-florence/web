import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useNavStore } from '@/stores/navStore'
import { cn } from '@/lib/utils'

export function Layout() {
  const collapsed = useNavStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/[0.03] -z-10" />
      <Sidebar />
      <div className={cn('flex-1 transition-all duration-300', collapsed ? 'ml-16' : 'ml-64')}>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
