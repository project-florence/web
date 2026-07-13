import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StockChart } from '@/components/shared/StockChart'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { useNavStore } from '@/stores/navStore'
import api from '@/lib/api'
import type { CompanyInfo, PriceHistory, NewsItem, ReportResult } from '@/types/api'

const PERIODS = [
  { label: '1ay', value: '1mo', interval: '1d' },
  { label: '3ay', value: '3mo', interval: '1d' },
  { label: '6ay', value: '6mo', interval: '1wk' },
  { label: '1y', value: '1y', interval: '1wk' },
  { label: '5y', value: '5y', interval: '1mo' },
] as const

function safeFixed(n: number | null | undefined, digits: number, fallback = '—'): string {
  if (n === null || n === undefined) return fallback
  return n.toFixed(digits)
}

function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return `₺${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function StatCard({ label, value, sub, positive }: {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
}) {
  return (
    <Card className={cn(
      'border-l-2 transition-colors',
      positive === true && 'border-l-success',
      positive === false && 'border-l-destructive',
      positive === undefined && 'border-l-border',
    )}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className={cn(
          'text-lg font-bold',
          positive === true && 'text-success',
          positive === false && 'text-destructive',
        )}>{value}</p>
        {sub && <p className={cn(
          'text-xs mt-0.5',
          positive === true && 'text-success/80',
          positive === false && 'text-destructive/80',
          positive === undefined && 'text-muted-foreground',
        )}>{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setLastStockTicker = useNavStore((s) => s.setLastStockTicker)
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[0])

  useEffect(() => {
    if (ticker) setLastStockTicker(ticker)
  }, [ticker, setLastStockTicker])

  const { data: info, isLoading: infoLoading } = useQuery({
    queryKey: ['company-info', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/info/${ticker}`)
      return res.data as CompanyInfo
    },
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  })

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['price-history', ticker, period.value],
    queryFn: async () => {
      const res = await api.get(`/api/v1/price/history/${ticker}`, {
        params: { period: period.value, interval: period.interval },
      })
      return res.data as PriceHistory[]
    },
    enabled: !!ticker,
    staleTime: 2 * 60_000,
  })

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/news/${ticker}`, { params: { amount: 10 } })
      return res.data as NewsItem[]
    },
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  })

  const { data: quickReport, isLoading: quickReportLoading } = useQuery({
    queryKey: ['quick-report', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/generate/report/quick/${ticker}`)
      return res.data as ReportResult
    },
    enabled: !!ticker,
    staleTime: 30 * 60_000,
  })

  const { data: deepReport, isLoading: deepReportLoading } = useQuery({
    queryKey: ['deep-report', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/generate/report/deep/${ticker}`)
      return res.data as ReportResult
    },
    enabled: !!ticker,
    staleTime: 60 * 60_000,
  })

  const { data: searchInfo } = useQuery({
    queryKey: ['search-info', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/search/${ticker}`)
      return res.data as Array<{ name: string; ticker: string }>
    },
    enabled: !!ticker,
    staleTime: Infinity,
  })

  if (infoLoading && !info) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const m = info?.market
  const v = info?.valuation
  const f = info?.financials
  const latest = history?.[history.length - 1]
  const prev = history?.[history.length - 2]
  const change = latest && prev ? ((latest.close - prev.close) / prev.close) * 100 : undefined
  const companyName = info?.name || searchInfo?.[0]?.name || ticker

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('/stocks')}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Geri
      </Button>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{ticker}</h2>
            {change !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  'text-sm px-3 py-1 font-semibold border-2',
                  change >= 0
                    ? 'text-success border-success bg-success/10'
                    : 'text-destructive border-destructive bg-destructive/10',
                )}
              >
                {change >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-1 inline" /> : <TrendingDown className="h-3.5 w-3.5 mr-1 inline" />}
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </Badge>
            )}
          </div>
          <p className={cn(
            'mt-1 font-medium',
            change !== undefined && (change >= 0 ? 'text-success' : 'text-destructive'),
          )}>{companyName}</p>
          {info?.sector && <p className="text-xs text-muted-foreground">{info.sector} · {info.industry}</p>}
        </div>
        {ticker && <FavoriteButton ticker={ticker} />}
      </div>

      {m && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Fiyat" value={fmtCurrency(m.currentPrice)} positive={change !== undefined ? change >= 0 : undefined} />
          <StatCard label="Piyasa Değeri" value={fmt(m.marketCap)} />
          <StatCard label="Gün Aralığı" value={fmtCurrency(m.dayLow)} sub={`— ${fmtCurrency(m.dayHigh)}`} />
          <StatCard label="Hacim" value={fmt(m.regularMarketVolume)} />
          <StatCard label="52H Yüksek" value={fmtCurrency(m.fiftyTwoWeekHigh)} positive />
          <StatCard label="52H Düşük" value={fmtCurrency(m.fiftyTwoWeekLow)} positive={false} />
        </div>
      )}

      {v && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <StatCard label="F/K (Trailing)" value={safeFixed(v.trailingPE, 2)} />
          <StatCard label="F/K (Forward)" value={safeFixed(v.forwardPE, 2)} />
          <StatCard label="PD/DD" value={safeFixed(v.priceToBook, 2)} />
          <StatCard label="Temettü Verimi" value={v.dividendYield ? `%${safeFixed(v.dividendYield, 2)}` : '—'} />
          <StatCard label="Hedef Fiyat (Ort)" value={fmtCurrency(v.targetMeanPrice)} />
          <StatCard label="Hedef Fiyat (Yüksek)" value={fmtCurrency(v.targetHighPrice)} />
          <StatCard label="Hedef Fiyat (Düşük)" value={fmtCurrency(v.targetLowPrice)} />
          <StatCard label="Hedefe Uzaklık" value={v.targetMeanPrice && m ? `%${((v.targetMeanPrice / m.currentPrice - 1) * 100).toFixed(1)}` : '—'} />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium">Periyot:</span>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period.value === p.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <StockChart data={history ?? []} loading={historyLoading} />
        </CardContent>
      </Card>

      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">{t('stockDetail.news')}</TabsTrigger>
          <TabsTrigger value="reports">{t('stockDetail.reports')}</TabsTrigger>
          {f && <TabsTrigger value="financials">Finansallar</TabsTrigger>}
        </TabsList>

        <TabsContent value="news" className="mt-4">
          <div className="space-y-3">
            {newsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))
              : news?.map((item, i) => (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.date).toLocaleDateString('tr-TR')}
                        </p>
                      </CardContent>
                    </Card>
                  </a>
                ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('stockDetail.quickReport')}</CardTitle>
              </CardHeader>
              <CardContent>
                {quickReportLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground">{quickReport || t('common.noData')}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('stockDetail.deepReport')}</CardTitle>
              </CardHeader>
              <CardContent>
                {deepReportLoading ? (
                  <Skeleton className="h-12 w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground">{deepReport || t('common.noData')}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {f && (
          <TabsContent value="financials" className="mt-4">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Gelir" value={fmt(f.totalRevenue)} />
              <StatCard label="Net Kar" value={fmt(f.netIncomeToCommon)} />
              <StatCard label="Kar Marjı" value={`%${(f.profitMargins * 100).toFixed(2)}`} />
              <StatCard label="Ciro Büyüme" value={f.revenueGrowth ? `%${(f.revenueGrowth * 100).toFixed(1)}` : '—'} />
              <StatCard label="Öz Sermaye Kârlılığı" value={`%${(f.returnOnEquity * 100).toFixed(2)}`} />
              <StatCard label="Nakit" value={fmt(info.balanceSheet.totalCash)} />
              <StatCard label="Borç" value={fmt(info.balanceSheet.totalDebt)} />
              <StatCard label="Borç/Öz Sermaye" value={info.balanceSheet.debtToEquity.toFixed(1)} />
              <StatCard label="Cari Oran" value={info.balanceSheet.currentRatio.toFixed(2)} />
              <StatCard label="EBITDA" value={fmt(f.ebitda)} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
