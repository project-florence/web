import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

function StatCard({ title, value, change, loading }: {
  title: string
  value?: string
  change?: number
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value || '—'}</div>
            {change !== undefined && (
              <p className={`text-xs mt-1 ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
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

  const { data: economy, isLoading: economyLoading } = useQuery({
    queryKey: ['economy'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/currency')
      return res.data
    },
  })

  const { data: gold, isLoading: goldLoading } = useQuery({
    queryKey: ['gold'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data
    },
  })

  const { data: macro, isLoading: macroLoading } = useQuery({
    queryKey: ['macro'],
    queryFn: async () => {
      const res = await api.get('/api/v1/macroeconomy/all')
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t('dashboard.gold')}
          value={gold?.price ? `₺${gold.price.toLocaleString()}` : undefined}
          change={gold?.change}
          loading={goldLoading}
        />
        <StatCard
          title={t('dashboard.usd')}
          value={economy?.USD ? `₺${economy.USD.toFixed(2)}` : undefined}
          loading={economyLoading}
        />
        <StatCard
          title={t('dashboard.eur')}
          value={economy?.EUR ? `₺${economy.EUR.toFixed(2)}` : undefined}
          loading={economyLoading}
        />
        <StatCard
          title={t('dashboard.bist100')}
          value={macro?.bist100 ? `${macro.bist100.toLocaleString()}` : undefined}
          change={macro?.bist100_change}
          loading={macroLoading}
        />
      </div>

      {macro && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title={t('dashboard.inflation')}
            value={macro.inflation ? `%${macro.inflation}` : undefined}
            loading={macroLoading}
          />
          <StatCard
            title={t('dashboard.interest')}
            value={macro.interest_rate ? `%${macro.interest_rate}` : undefined}
            loading={macroLoading}
          />
          <StatCard
            title={t('dashboard.unemployment')}
            value={macro.unemployment ? `%${macro.unemployment}` : undefined}
            loading={macroLoading}
          />
        </div>
      )}
    </div>
  )
}
