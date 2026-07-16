import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StockSearch } from '@/components/shared/StockSearch'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { CompanyCard } from '@/components/shared/CompanyCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavStore } from '@/stores/navStore'
import api from '@/lib/api'
import type { CompanySummary } from '@/types/api'

const PER_PAGE = 50

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
          : companies.map((company, i) => (
              <div key={company.ticker} className="animate-slideUp" style={{ animationDelay: `${(i % 12) * 50}ms` }}>
                <CompanyCard
                  company={company}
                  action={<FavoriteButton ticker={company.ticker} />}
                />
              </div>
            ))}
      </div>
    </div>
  )
}
