import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CompanyCard } from '@/components/shared/CompanyCard'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { FavoritesResponse, CompanySummaryResponse } from '@/types/api'

export default function WatchlistPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading: favsLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/v1/favorites')
      return (res.data as FavoritesResponse).favorites
    },
    staleTime: 60_000,
  })

  const { data: summaries, isLoading: summariesLoading } = useQuery({
    queryKey: ['favorite-summaries', favorites],
    queryFn: async () => {
      const res = await api.get('/api/v1/companies/summary', {
        params: { limit: 500, tickers: favorites!.join(',') },
      })
      return (res.data as CompanySummaryResponse).data
    },
    enabled: !!favorites?.length,
    staleTime: 60_000,
  })

  const removeMutation = useMutation({
    mutationFn: async (ticker: string) => {
      await api.delete(`/api/v1/favorites/${ticker}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
      toast.success(t('watchlist.removeSuccess'))
    },
  })

  const isLoading = favsLoading || summariesLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!favorites?.length) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">{t('watchlist.title')}</h2>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {t('watchlist.empty')}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('watchlist.title')}</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {summaries?.map((company) => (
          <CompanyCard
            key={company.ticker}
            company={company}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeMutation.mutate(company.ticker)
                }}
                className="hover:bg-destructive/10 hover:scale-110 transition-all duration-200"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            }
          />
        ))}
      </div>
    </div>
  )
}
