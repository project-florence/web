import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router'
import api from '@/lib/api'
import type { BistCompany } from '@/types/api'

export default function WatchlistPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data: favorites, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await api.get('/api/v1/favorites')
      return res.data as BistCompany[]
    },
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
          <Skeleton key={i} className="h-20 w-full" />
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
      <div className="grid gap-4">
        {favorites.map((item) => (
          <Card key={item.symbol}>
            <CardContent className="p-4 flex items-center justify-between">
              <Link to={`/stocks/${item.symbol}`} className="flex-1">
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-primary">{item.symbol}</span>
                  <span className="text-sm truncate">{item.name}</span>
                  {item.price !== undefined && (
                    <span className="text-lg font-bold">₺{item.price.toFixed(2)}</span>
                  )}
                  {item.change !== undefined && (
                    <span className={`text-sm ${item.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                    </span>
                  )}
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeMutation.mutate(item.symbol)}
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
