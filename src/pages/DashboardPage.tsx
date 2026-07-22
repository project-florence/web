import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Search, BarChart3, Sparkles, Star, ChevronRight } from 'lucide-react'
import { DateTimeWidget } from '@/components/shared/DateTimeWidget'
import api from '@/lib/api'
import type { CompanySummary, FavoritesResponse } from '@/types/api'

interface RateEntry {
  Buying: string
  Selling: string
  Type: string
  Change: string
}

function parsePrice(s: string | undefined): number | null {
  if (!s) return null
  const cleaned = s
    .replace(/[^0-9,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseChange(s: string | undefined): number | null {
  if (!s) return null
  const cleaned = s.replace('%', '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function StatCard({ title, value, change, loading }: {
  title: string
  value?: string
  change?: number | null
  loading: boolean
}) {
  return (
    <Card className={cn(
      'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5',
      change !== undefined && change !== null && 'border-l-2',
      change !== undefined && change !== null && change >= 0 && 'border-l-success',
      change !== undefined && change !== null && change < 0 && 'border-l-destructive',
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value || '—'}</p>
        )}
        {change !== undefined && change !== null && (
          <div className={cn(
            'flex items-center gap-1 mt-1 text-xs font-semibold',
            change >= 0 ? 'text-success' : 'text-destructive',
          )}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['rates'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/currency')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: gold, isLoading: goldLoading } = useQuery({
    queryKey: ['gold'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: favorites } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/v1/favorites')
      return (res.data as FavoritesResponse).favorites
    },
    staleTime: 30_000,
  })

  const { data: favoriteSummaries } = useQuery({
    queryKey: ['favorite-summaries-dash', favorites],
    queryFn: async () => {
      const res = await api.get('/api/v1/companies/summary', {
        params: { limit: 10, tickers: favorites!.slice(0, 10).join(',') },
      })
      return (res.data as { data: CompanySummary[] }).data
    },
    enabled: !!favorites?.length,
    staleTime: 30_000,
  })

  const usd = rates?.USD
  const eur = rates?.EUR
  const gramAltin = gold?.['gram-altin']

  const usdPrice = usd ? parsePrice(usd.Buying) : null
  const usdChange = usd ? parseChange(usd.Change) : null
  const eurPrice = eur ? parsePrice(eur.Buying) : null
  const eurChange = eur ? parseChange(eur.Change) : null
  const goldPrice = gramAltin ? parsePrice(gramAltin.Buying) : null
  const goldChange = gramAltin ? parseChange(gramAltin.Change) : null

  const displayFavorites = favoriteSummaries ?? []
  const hasMore = (favorites?.length ?? 0) > displayFavorites.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
      </div>

      <div className="flex gap-4 flex-col lg:flex-row">
        <Card className="flex-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Hoş Geldiniz</h3>
              </div>
              <p className="text-sm text-muted-foreground">Piyasaları takip et, akıllı yatırım kararları al.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="gradient" size="sm" onClick={() => navigate('/stocks')}>
                <TrendingUp className="h-4 w-4 mr-1" />
                Hisse Ara
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/simulation')}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Analiz Yap
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/advisor')}>
                <Search className="h-4 w-4 mr-1" />
                Danışman
              </Button>
            </div>
          </CardContent>
        </Card>
        <DateTimeWidget />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">{t('watchlist.title')}</CardTitle>
          </div>
          {hasMore && (
            <Button variant="ghost" size="sm" className="text-xs gap-0.5" onClick={() => navigate('/watchlist')}>
              {t('watchlist.title')}
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {displayFavorites.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {displayFavorites.map((company) => {
                const ch = company.change_pct
                return (
                  <Card
                    key={company.ticker}
                    className="flex-1 min-w-[140px] max-w-[200px] cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                    onClick={() => navigate(`/stocks/${company.ticker}`)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono font-bold text-sm text-primary">{company.ticker}</span>
                        {ch !== null && ch !== undefined && (
                          <Badge variant="outline" className={cn(
                            'text-[10px] px-1 py-0',
                            ch >= 0 ? 'text-success border-success/30' : 'text-destructive border-destructive/30',
                          )}>
                            {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{company.name}</p>
                      {company.last_price !== null && (
                        <p className="text-sm font-bold mt-1">₺{company.last_price.toFixed(2)}</p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Takip listeniz boş. Hisseler sayfasından hisse ekleyebilirsiniz.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="animate-slideUp animate-delay-100">
          <StatCard
            title={t('dashboard.gold')}
            value={goldPrice ? `₺${goldPrice.toLocaleString('tr-TR')}` : undefined}
            change={goldChange}
            loading={goldLoading}
          />
        </div>
        <div className="animate-slideUp animate-delay-200">
          <StatCard
            title={t('dashboard.usd')}
            value={usdPrice ? `₺${usdPrice.toFixed(2)}` : undefined}
            change={usdChange}
            loading={ratesLoading}
          />
        </div>
        <div className="animate-slideUp animate-delay-300">
          <StatCard
            title={t('dashboard.eur')}
            value={eurPrice ? `₺${eurPrice.toFixed(2)}` : undefined}
            change={eurChange}
            loading={ratesLoading}
          />
        </div>
      </div>

      <Card className="hover:border-primary/20 transition-colors duration-200">
        <CardHeader>
          <CardTitle className="text-sm">{t('dashboard.macroeconomy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Makroekonomi verileri henüz eklenmemiştir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
