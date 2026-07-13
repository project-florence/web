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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/navStore'
import type { MouseEvent } from 'react'

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const lastStockTicker = useNavStore((s) => s.lastStockTicker)

  const handleStocksClick = (e: MouseEvent) => {
    if (lastStockTicker) {
      e.preventDefault()
      navigate(`/stocks/${lastStockTicker}`)
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar p-4 flex flex-col">
      <div className="flex items-center gap-2 px-2 py-4 mb-6">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">F</span>
        </div>
        <span className="font-semibold text-lg">{t('app.name')}</span>
      </div>

      <nav className="flex-1 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          {t('nav.dashboard')}
        </NavLink>
        <NavLink
          to="/stocks"
          end={!lastStockTicker}
          onClick={handleStocksClick}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              (isActive || location.pathname.startsWith('/stocks/'))
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <TrendingUp className="h-4 w-4" />
          {t('nav.stocks')}
        </NavLink>
        <NavLink
          to="/watchlist"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <Star className="h-4 w-4" />
          {t('nav.watchlist')}
        </NavLink>
        <NavLink
          to="/analysis"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <BarChart3 className="h-4 w-4" />
          {t('nav.analysis')}
        </NavLink>
        <NavLink
          to="/scout"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <Search className="h-4 w-4" />
          {t('nav.scout')}
        </NavLink>
        <NavLink
          to="/ipos"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <Rocket className="h-4 w-4" />
          {t('nav.ipos')}
        </NavLink>
        <NavLink
          to="/currency"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <DollarSign className="h-4 w-4" />
          {t('nav.currency')}
        </NavLink>
        <NavLink
          to="/metals"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
            )
          }
        >
          <Gem className="h-4 w-4" />
          {t('nav.metals')}
        </NavLink>
      </nav>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted',
          )
        }
      >
        <User className="h-4 w-4" />
        {t('nav.profile')}
      </NavLink>
    </aside>
  )
}
