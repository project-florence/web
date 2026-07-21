import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  TrendingUp,
  Star,
  BarChart3,
  Search,
  Rocket,
  DollarSign,
  Gem,
  User,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/navStore'
import { CreditDisplay } from '@/components/shared/CreditDisplay'
import type { MouseEvent } from 'react'

const navItems = [
  { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard', end: true, activeCheck: (p: string) => p === '/' },
  { to: '/stocks', icon: TrendingUp, labelKey: 'nav.stocks', stocks: true, activeCheck: (p: string) => p.startsWith('/stocks') },
  { to: '/watchlist', icon: Star, labelKey: 'nav.watchlist', activeCheck: (p: string) => p === '/watchlist' },
  { to: '/simulation', icon: BarChart3, labelKey: 'nav.simulation', activeCheck: (p: string) => p === '/simulation' },
  { to: '/advisor', icon: Search, labelKey: 'nav.scout', activeCheck: (p: string) => p === '/advisor' },
  { to: '/ipos', icon: Rocket, labelKey: 'nav.ipos', activeCheck: (p: string) => p === '/ipos' },
  { to: '/currency', icon: DollarSign, labelKey: 'nav.currency', activeCheck: (p: string) => p === '/currency' },
  { to: '/metals', icon: Gem, labelKey: 'nav.metals', activeCheck: (p: string) => p === '/metals' },
]

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const lastStockTicker = useNavStore((s) => s.lastStockTicker)
  const collapsed = useNavStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useNavStore((s) => s.toggleSidebar)

  const linkClass = (active: boolean) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group whitespace-nowrap',
      active
        ? 'bg-primary/10 text-primary border-l-2 border-primary rounded-l-none'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:translate-x-0.5',
      collapsed && 'border-l-0 rounded-lg justify-center px-2',
    )

  const handleStocksClick = (e: MouseEvent) => {
    if (lastStockTicker) {
      e.preventDefault()
      navigate(`/stocks/${lastStockTicker}`)
    }
  }

  return (
    <>
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/40"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar p-3 flex flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
        )}
        onMouseEnter={() => {
          if (!collapsed) return
        }}
      >
        <div className={cn('flex items-center gap-2 px-2 py-4 mb-4', collapsed && 'justify-center px-0')}>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          {!collapsed && (
            <>
              <span className="font-semibold text-lg">{t('app.name')}</span>
              <button
                type="button"
                onClick={toggleSidebar}
                className="ml-auto p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              type="button"
              onClick={toggleSidebar}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors absolute -right-3 top-5 bg-sidebar border border-border rounded-full shadow-sm"
            >
              <PanelLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <nav className={cn('flex-1 space-y-1', collapsed && 'space-y-2')}>
          {navItems.map((item) => {
            const active = item.activeCheck(location.pathname)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end ?? false}
                onClick={item.stocks ? handleStocksClick : undefined}
                className={linkClass(active)}
                aria-current={active ? 'page' : undefined}
              >
                <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0" />
                {!collapsed && <span>{t(item.labelKey)}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className={cn('border-t border-border pt-3 space-y-2', collapsed && 'flex flex-col items-center pt-2')}>
          <div className={cn(collapsed && 'flex justify-center')}>
            <CreditDisplay size="sm" />
          </div>
          <NavLink
            to="/profile"
            className={linkClass(location.pathname === '/profile')}
          >
            <User className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 shrink-0" />
            {!collapsed && t('nav.profile')}
          </NavLink>
        </div>
      </aside>
    </>
  )
}
