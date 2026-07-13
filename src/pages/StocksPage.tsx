import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { StockSearch } from '@/components/shared/StockSearch'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { ChevronLeft, ChevronRight, Building2, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavStore } from '@/stores/navStore'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

const PER_PAGE = 50

function fmtVolume(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString('tr-TR')
}

function fmtCap(n: number | null): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  return n.toLocaleString('tr-TR')
}

function fmtPrice(n: number | null): string {
  if (n === null || n === undefined) return '—'
  return `₺${n.toFixed(2)}`
}

export default function StocksPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const savedPage = useNavStore((s) => s.stocksPage)
  const setStocksPage = useNavStore((s) => s.setStocksPage)
  const [page, setPage] = useState(savedPage)

  useEffect(() => {
    setStocksPage(page)
  }, [page, setStocksPage])

  const offset = (page - 1) * PER_PAGE

  const { data, isLoading } = useQuery({
    queryKey: ['companies-summary', page],
    queryFn: async () => {
      const res = await api.get('/api/v1/companies/summary', {
        params: { limit: PER_PAGE, offset, sort: 'popular' },
      })
      return res.data as CompanySummary[]
    },
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) => prev,
  })

  const companies = data ?? []
  const isLastPage = companies.length < PER_PAGE

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('stocks.title')}</h2>
      </div>

      <div className="max-w-sm">
        <StockSearch
          onSelect={(ticker) => navigate(`/stocks/${ticker}`)}
          autoFocus
        />
      </div>

      {!isLoading && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground min-w-[5rem] text-center">
              Sayfa {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isLastPage}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: PER_PAGE }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          : companies.map((company) => (
              <Card
                key={company.ticker}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/stocks/${company.ticker}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-primary">{company.ticker}</span>
                    <FavoriteButton ticker={company.ticker} />
                  </div>
                  <p className="text-sm font-medium truncate mb-2">{company.name}</p>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xl font-bold">{fmtPrice(company.last_price)}</span>
                    {company.change_pct !== null && (
                      <span className={cn(
                        'text-sm font-semibold flex items-center gap-0.5',
                        company.change_pct >= 0 ? 'text-success' : 'text-destructive',
                      )}>
                        {company.change_pct >= 0
                          ? <TrendingUp className="h-3 w-3" />
                          : <TrendingDown className="h-3 w-3" />
                        }
                        {company.change_pct >= 0 ? '+' : ''}{company.change_pct.toFixed(2)}%
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {company.sector && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        <Building2 className="h-2.5 w-2.5 mr-0.5" />
                        {company.sector}
                      </Badge>
                    )}
                    <span>H: {fmtVolume(company.volume)}</span>
                    <span>PiD: {fmtCap(company.market_cap)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
