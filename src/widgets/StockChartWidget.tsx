import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StockChart } from '@/components/shared/StockChart'
import { processPriceData } from '@/lib/price'
import api from '@/lib/api'
import type { PriceHistory } from '@/types/api'

const PERIODS = [
  { label: '1mo', value: '1mo' },
  { label: '3mo', value: '3mo' },
  { label: '6mo', value: '6mo' },
  { label: '1y', value: '1y' },
] as const

const INTERVALS = [
  { label: '1g', value: '1d' },
  { label: '1h', value: '1wk' },
  { label: '1a', value: '1mo' },
] as const

export default function StockChartWidget({ config }: { config?: Record<string, unknown> }) {
  const ticker = (config?.ticker as string) || 'THYAO'
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>(PERIODS[0])
  const [interval, setInterval] = useState<string>('1d')

  const { data, isLoading } = useQuery({
    queryKey: ['price-history-full', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/price/history/${ticker}`, {
        params: { period: '5y', interval: '1d' },
      })
      return res.data as PriceHistory[]
    },
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  })

  const processed = useMemo(() => {
    if (!data) return { data: [] as PriceHistory[], from: 0, to: 0 }
    return processPriceData(data, period.value, interval)
  }, [data, period.value, interval])

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{ticker}</CardTitle>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <Button
                key={p.value}
                variant={period.value === p.value ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setPeriod(p)}
                className="text-[10px] h-6 px-1.5"
              >
                {p.label}
              </Button>
            ))}
            <span className="text-[10px] text-muted-foreground mx-0.5">|</span>
            {INTERVALS.map((i) => (
              <Button
                key={i.value}
                variant={interval === i.value ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setInterval(i.value)}
                className="text-[10px] h-6 px-1.5"
              >
                {i.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data && data.length > 0 ? (
          <StockChart data={processed.data} loading={false} visibleRange={{ from: processed.from, to: processed.to }} />
        ) : (
          <p className="text-xs text-muted-foreground">No data</p>
        )}
      </CardContent>
    </Card>
  )
}
