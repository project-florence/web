import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StockSearch } from '@/components/shared/StockSearch'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import type { BistCompany } from '@/types/api'

const PER_PAGE = 50

export default function StocksPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/api/v1/bist/companies')
      return res.data as BistCompany[]
    },
    staleTime: 30 * 24 * 60 * 60 * 1000,
    gcTime: 30 * 24 * 60 * 60 * 1000,
  })

  const totalPages = companies ? Math.max(1, Math.ceil(companies.length / PER_PAGE)) : 1
  const paged = companies?.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('stocks.title')}</h2>
        {companies && (
          <span className="text-sm text-muted-foreground">
            {companies.length} şirket
          </span>
        )}
      </div>

      <div className="max-w-sm">
        <StockSearch
          onSelect={(ticker) => navigate(`/stocks/${ticker}`)}
          autoFocus
        />
      </div>

      {!isLoading && companies && (
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
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 3, totalPages - 6))
              const pg = start + i
              if (pg > totalPages) return null
              return (
                <Button
                  key={pg}
                  variant={pg === page ? 'default' : 'outline'}
                  size="sm"
                  className="min-w-[2rem]"
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            Sayfa {page} / {totalPages}
          </span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: PER_PAGE }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          : paged?.map((company) => (
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
