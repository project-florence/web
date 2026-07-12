import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  BarChart3,
  Search,
  Rocket,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'nav.dashboard' },
  { to: '/stocks', icon: TrendingUp, label: 'nav.stocks' },
  { to: '/watchlist', icon: Star, label: 'nav.watchlist' },
  { to: '/analysis', icon: BarChart3, label: 'nav.analysis' },
  { to: '/scout', icon: Search, label: 'nav.scout' },
  { to: '/ipos', icon: Rocket, label: 'nav.ipos' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const logout = useAuthStore((s) => s.logout)

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">F</span>
        </div>
        <span className="font-semibold text-lg">{t('app.name')}</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {t(item.label)}
          </NavLink>
        ))}
      </nav>

      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" />
        {t('nav.logout')}
      </Button>
    </aside>
  )
}
