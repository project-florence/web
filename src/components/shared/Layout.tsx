import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import bgImage from '@/assets/background/login_background.png'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/60 to-background/85 backdrop-blur-[2px]" />
      </div>
      <Sidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <main className="p-6">
          <div key={location.pathname} className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
