import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface RateEntry {
  Buying: string
  Selling: string
  Type: string
  Change: string
}

function parsePrice(s: string | undefined): number | null {
  if (!s) return null
  const cleaned = s
    .replace(/[^0-9,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseChange(s: string | undefined): number | null {
  if (!s) return null
  const cleaned = s.replace('%', '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function StatCard({ title, value, change, loading }: {
  title: string
  value?: string
  change?: number | null
  loading: boolean
}) {
  return (
    <Card className={cn(
      change !== undefined && change !== null && 'border-l-2',
      change !== undefined && change !== null && change >= 0 && 'border-l-success',
      change !== undefined && change !== null && change < 0 && 'border-l-destructive',
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className={cn(
              'text-2xl font-bold',
              change !== undefined && change !== null && change >= 0 && 'text-success',
              change !== undefined && change !== null && change < 0 && 'text-destructive',
            )}>{value || '—'}</div>
            {change !== undefined && change !== null && (
              <p className={cn(
                'text-xs mt-1',
                change >= 0 ? 'text-success' : 'text-destructive',
              )}>
                {change >= 0 ? '+' : ''}{change.toFixed(2)}%
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation()

  const { data: rates, isLoading: ratesLoading } = useQuery({
    queryKey: ['economy'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/currency')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: gold, isLoading: goldLoading } = useQuery({
    queryKey: ['gold'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const usd = rates?.USD
  const eur = rates?.EUR
  const gramAltin = gold?.['gram-altin']

  const usdPrice = usd ? parsePrice(usd.Buying) : null
  const usdChange = usd ? parseChange(usd.Change) : null
  const eurPrice = eur ? parsePrice(eur.Buying) : null
  const eurChange = eur ? parseChange(eur.Change) : null
  const goldPrice = gramAltin ? parsePrice(gramAltin.Buying) : null
  const goldChange = gramAltin ? parseChange(gramAltin.Change) : null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.gold')}
          value={goldPrice ? `₺${goldPrice.toLocaleString('tr-TR')}` : undefined}
          change={goldChange}
          loading={goldLoading}
        />
        <StatCard
          title={t('dashboard.usd')}
          value={usdPrice ? `₺${usdPrice.toFixed(2)}` : undefined}
          change={usdChange}
          loading={ratesLoading}
        />
        <StatCard
          title={t('dashboard.eur')}
          value={eurPrice ? `₺${eurPrice.toFixed(2)}` : undefined}
          change={eurChange}
          loading={ratesLoading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{t('dashboard.macroeconomy')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Makroekonomi verileri henüz eklenmemiştir.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
