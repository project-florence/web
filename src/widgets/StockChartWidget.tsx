import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StockChart } from '@/components/shared/StockChart'
import api from '@/lib/api'
import type { PriceHistory } from '@/types/api'

const PERIODS = [
  { label: '1mo', value: '1mo', interval: '1d' },
  { label: '3mo', value: '3mo', interval: '1d' },
  { label: '6mo', value: '6mo', interval: '1wk' },
  { label: '1y', value: '1y', interval: '1wk' },
] as const

export default function StockChartWidget({ config }: { config?: Record<string, unknown> }) {
  const ticker = (config?.ticker as string) || 'THYAO'
  const [period] = useState<(typeof PERIODS)[number]>(PERIODS[0])

  const { data, isLoading } = useQuery({
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

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{ticker}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data && data.length > 0 ? (
          <StockChart data={data} loading={false} />
        ) : (
          <p className="text-xs text-muted-foreground">No data</p>
        )}
      </CardContent>
    </Card>
  )
}
