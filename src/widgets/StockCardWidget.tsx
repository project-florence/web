import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

export default function StockCardWidget({ config }: { config?: Record<string, unknown> }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const ticker = (config?.ticker as string) || 'THYAO'

  const { data, isLoading } = useQuery({
    queryKey: ['stock-card', ticker],
    queryFn: async () => {
      const res = await api.get('/api/v1/companies/summary', { params: { limit: 1, tickers: ticker } })
      return (res.data as { data: CompanySummary[] }).data[0]
    },
    enabled: !!ticker,
    staleTime: 30_000,
  })

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="h-full">
        <CardContent className="p-4 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">{t('common.noData')}</p>
        </CardContent>
      </Card>
    )
  }

  const ch = data.change_pct

  return (
    <Card className="h-full cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200" onClick={() => navigate(`/stocks/${data.ticker}`)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono font-bold text-sm text-primary">{data.ticker}</span>
          {ch !== null && ch !== undefined && (
            <Badge variant="outline" className={cn(
              'text-[10px] px-1 py-0',
              ch >= 0 ? 'text-success border-success/30' : 'text-destructive border-destructive/30',
            )}>
              {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{data.name}</p>
        {data.last_price !== null && (
          <p className="text-lg font-bold mt-2">₺{data.last_price.toFixed(2)}</p>
        )}
      </CardContent>
    </Card>
  )
}
