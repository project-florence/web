import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StockSearch } from '@/components/shared/StockSearch'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import api from '@/lib/api'
import type { BistCompany } from '@/types/api'

export default function StocksPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/api/v1/bist/companies')
      return res.data as BistCompany[]
    },
    staleTime: 30 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
  })

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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 12 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          : companies?.map((company) => (
              <Card
                key={company.ticker}
                className="hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/stocks/${company.ticker}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-primary">{company.ticker}</span>
                    <FavoriteButton ticker={company.ticker} />
                  </div>
                  <p className="text-sm font-medium truncate">{company.name}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span>{company.city}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  )
}
