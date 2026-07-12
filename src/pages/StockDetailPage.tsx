import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { PriceHistory, NewsItem, CompanyInfo } from '@/types/api'

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const { t } = useTranslation()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: info, isLoading: infoLoading } = useQuery({
    queryKey: ['company-info', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/info/${ticker}`)
      return res.data as CompanyInfo
    },
    enabled: !!ticker,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['price-history', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/price/history/${ticker}`, {
        params: { period: '1mo', interval: '1d' },
      })
      return res.data as PriceHistory[]
    },
    enabled: !!ticker,
  })

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/news/${ticker}`, {
        params: { amount: 5 },
      })
      return res.data as NewsItem[]
    },
    enabled: !!ticker,
  })

  const addToWatchlist = async () => {
    if (!isAuthenticated) {
      toast.error('Giriş yapmalısınız')
      return
    }
    try {
      await api.post(`/api/v1/favorites/${ticker}`)
      toast.success(t('watchlist.addSuccess'))
    } catch {
      toast.error(t('common.error'))
    }
  }

  if (infoLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const latestPrice = history?.[history.length - 1]
  const prevPrice = history?.[history.length - 2]
  const change = latestPrice && prevPrice
    ? ((latestPrice.close - prevPrice.close) / prevPrice.close) * 100
    : undefined

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{ticker}</h2>
            {change !== undefined && (
              <Badge variant={change >= 0 ? 'default' : 'destructive'} className="text-sm">
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">{info?.name}</p>
        </div>
        <Button variant="outline" onClick={addToWatchlist}>
          <Star className="h-4 w-4 mr-2" />
          {t('stocks.addToWatchlist')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('stocks.price')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {latestPrice ? `₺${latestPrice.close.toFixed(2)}` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t('stocks.sector')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{info?.sector || '—'}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">{t('stockDetail.chart')}</TabsTrigger>
          <TabsTrigger value="news">{t('stockDetail.news')}</TabsTrigger>
          <TabsTrigger value="reports">{t('stockDetail.reports')}</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {historyLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : history && history.length > 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {/* Lightweight Charts entegrasyonu buraya gelecek */}
                  <p>{t('stockDetail.chart')}</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t('common.noData')}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="news" className="mt-4">
          <div className="space-y-4">
            {newsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))
              : news?.map((item, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                          <p className="text-xs text-muted-foreground mt-2">{item.source} · {item.date}</p>
                        </div>
                        {item.sentiment && (
                          <Badge
                            variant={
                              item.sentiment === 'positive' ? 'default' :
                              item.sentiment === 'negative' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {item.sentiment}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('stockDetail.quickReport')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>{t('stockDetail.deepReport')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('common.noData')}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
