import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowLeft, TrendingUp, TrendingDown, FlaskConical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StockChart } from '@/components/shared/StockChart'
import { FavoriteButton } from '@/components/shared/FavoriteButton'
import { useNavStore } from '@/stores/navStore'
import api from '@/lib/api'
import type { CompanyInfo, PriceHistory, NewsItem } from '@/types/api'

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
  if (Math.abs(n) >= 1_000_000_000_000) return `${(n / 1_000_000_000_000).toFixed(2)}T`
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(2)}K`
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtCurrency(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return `₺${n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return `%${n.toFixed(2)}`
}

function StatCard({ label, value, sub, positive }: {
  label: string
  value: string
  sub?: string
  positive?: boolean | null
}) {
  return (
    <Card className={cn(
      'border-l-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5',
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

function pctChange(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined || b === undefined || b === 0) return undefined
  return ((a - b) / b) * 100
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

  const { data: dailyHistory } = useQuery({
    queryKey: ['daily-change', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/price/history/${ticker}`, {
        params: { period: '5d', interval: '1d' },
      })
      return res.data as PriceHistory[]
    },
    enabled: !!ticker,
    staleTime: 60_000,
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
  const tData = info?.trading
  const bs = info?.balanceSheet
  const companyName = info?.name || ticker

  const dh = dailyHistory
  const dailyClose = dh?.[dh.length - 1]?.close
  const dailyPrevClose = dh?.[dh.length - 2]?.close
  const dailyChange = pctChange(dailyClose, dailyPrevClose)

  const periodLatest = history?.[history.length - 1]?.close
  const periodPrev = history?.[history.length - 2]?.close
  const periodChange = pctChange(periodLatest, periodPrev)

  const isDailyPeriod = period.interval === '1d'

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
            {dailyChange !== undefined && (
              <Badge
                variant="outline"
                className={cn(
                  'text-sm px-3 py-1 font-semibold border-2',
                  dailyChange >= 0
                    ? 'text-success border-success bg-success/10'
                    : 'text-destructive border-destructive bg-destructive/10',
                )}
              >
                {dailyChange >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-1 inline" /> : <TrendingDown className="h-3.5 w-3.5 mr-1 inline" />}
                {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)}%
              </Badge>
            )}
          </div>
          <p className={cn(
            'mt-1 font-medium',
            dailyChange !== undefined && (dailyChange >= 0 ? 'text-success' : 'text-destructive'),
          )}>{companyName}</p>
          {info?.sector && <p className="text-xs text-muted-foreground">{info.sector} · {info.industry}</p>}
        </div>
        {ticker && (
            <div className="flex items-center gap-2">
              <FavoriteButton ticker={ticker} />
              <Button variant="outline" size="sm" onClick={() => navigate(`/analysis?ticker=${ticker}`)}>
                <FlaskConical className="h-4 w-4 mr-1" />
                Simülasyon
              </Button>
            </div>
          )}
      </div>

      {m && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          <StatCard label="Fiyat" value={fmtCurrency(m.currentPrice)} positive={dailyChange !== undefined ? dailyChange >= 0 : undefined} />
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
          <StatCard label="PEG Oranı" value={safeFixed(v.pegRatio, 2)} />
          <StatCard label="F/S (TTM)" value={safeFixed(v.priceToSalesTrailing12Months, 2)} />
          <StatCard label="Enterprise Değer" value={fmt(v.enterpriseValue)} />
          <StatCard label="Temettü Verimi" value={v.dividendYield ? `%${safeFixed(v.dividendYield, 2)}` : '—'} />
          <StatCard label="Hedef Fiyat (Ort)" value={fmtCurrency(v.targetMeanPrice)} />
        </div>
      )}

      {tData && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <StatCard label="Beta" value={safeFixed(tData.beta, 2)} positive={tData.beta < 1 ? true : tData.beta > 1 ? false : undefined} />
          <StatCard label="Ort. Hacim" value={fmt(tData.averageVolume)} />
          <StatCard label="Ort. Hacim (10g)" value={fmt(tData.averageVolume10days)} />
          <StatCard label="50g Ort." value={fmtCurrency(tData.fiftyDayAverage)} />
          <StatCard label="200g Ort." value={fmtCurrency(tData.twoHundredDayAverage)} />
          <StatCard label="Dolaşımdaki Hisse" value={fmt(tData.sharesOutstanding)} />
          <StatCard label="Float" value={fmt(tData.floatShares)} />
          <StatCard label="İçeriden Oran" value={`%${(tData.heldPercentInsiders * 100).toFixed(1)}`} />
          <StatCard label="Kurumsal Oran" value={`%${(tData.heldPercentInstitutions * 100).toFixed(1)}`} />
          <StatCard label="Short Oran" value={tData.shortRatio !== null ? safeFixed(tData.shortRatio, 1) : '—'} />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm font-medium">Periyot:</span>
            <div className="flex gap-1">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period.value === p.value ? 'gradient' : 'outline'}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className="text-xs"
                >
                  {p.label}
                </Button>
              ))}
            </div>
            {!isDailyPeriod && periodChange !== undefined && (
              <span className={cn(
                'text-xs font-medium ml-2',
                periodChange >= 0 ? 'text-success' : 'text-destructive',
              )}>
                {period.label} değişim: {periodChange >= 0 ? '+' : ''}{periodChange.toFixed(2)}%
              </span>
            )}
          </div>
          <StockChart data={history ?? []} loading={historyLoading} />
        </CardContent>
      </Card>

      <Tabs defaultValue="news">
        <TabsList>
          <TabsTrigger value="news">{t('stockDetail.news')}</TabsTrigger>
          {f && <TabsTrigger value="financials">Finansallar</TabsTrigger>}
          {bs && <TabsTrigger value="balance">Bilanço</TabsTrigger>}
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
                    <Card className="hover:bg-muted/50 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
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

        {f && (
          <TabsContent value="financials" className="mt-4">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              <StatCard label="Gelir" value={fmt(f.totalRevenue)} />
              <StatCard label="Net Kar" value={fmt(f.netIncomeToCommon)} />
              <StatCard label="Kar Marjı" value={fmtPct(f.profitMargins * 100)} />
              <StatCard label="Brüt Marj" value={fmtPct(f.grossMargins * 100)} />
              <StatCard label="EBITDA" value={fmt(f.ebitda)} />
              <StatCard label="EBITDA Marj" value={fmtPct(f.ebitdaMargins * 100)} />
              <StatCard label="Ciro Büyüme" value={f.revenueGrowth ? fmtPct(f.revenueGrowth * 100) : '—'} />
              <StatCard label="Öz Sermaye Kârlılığı" value={fmtPct(f.returnOnEquity * 100)} />
              <StatCard label="Aktif Kârlılığı" value={fmtPct(f.returnOnAssets * 100)} />
              <StatCard label="Serbest Nakit Akışı" value={fmt(f.freeCashflow)} />
            </div>
          </TabsContent>
        )}

        {bs && (
          <TabsContent value="balance" className="mt-4">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              <StatCard label="Nakit" value={fmt(bs.totalCash)} />
              <StatCard label="Hisse Başı Nakit" value={fmtCurrency(bs.totalCashPerShare)} />
              <StatCard label="Borç" value={fmt(bs.totalDebt)} />
              <StatCard label="Borç/Öz Sermaye" value={safeFixed(bs.debtToEquity, 1)} />
              <StatCard label="Cari Oran" value={safeFixed(bs.currentRatio, 2)} positive={bs.currentRatio >= 1 ? true : false} />
              <StatCard label="Likidite Oranı" value={safeFixed(bs.quickRatio, 2)} positive={bs.quickRatio >= 1 ? true : false} />
              <StatCard label="F/K Değer" value={m && f?.netIncomeToCommon ? safeFixed(m.marketCap / f.netIncomeToCommon, 2) : '—'} />
              <StatCard label="Hisse Başı Kâr" value={fmtCurrency(f?.netIncomeToCommon ? v?.trailingEps : null)} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
