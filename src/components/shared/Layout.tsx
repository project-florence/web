import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Footer } from './Footer'
import { useNavStore } from '@/stores/navStore'
import { cn } from '@/lib/utils'

export function Layout() {
  const collapsed = useNavStore((s) => s.sidebarCollapsed)

  return (
    <div className="flex min-h-screen relative">
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/[0.03] -z-10" />
      <Sidebar />
      <div className={cn('flex-1 transition-all duration-300 flex flex-col', collapsed ? 'ml-16' : 'ml-64')}>
        <main className="p-6 flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
