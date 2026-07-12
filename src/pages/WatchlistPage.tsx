import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import api from '@/lib/api'
import type { FavoritesResponse } from '@/types/api'

export default function WatchlistPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/v1/favorites')
      return (res.data as FavoritesResponse).favorites
    },
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
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
      <div className="grid gap-3">
        {favorites.map((ticker) => (
          <Card
            key={ticker}
            className="hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/stocks/${ticker}`)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-mono font-bold text-primary">{ticker}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  removeMutation.mutate(ticker)
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
