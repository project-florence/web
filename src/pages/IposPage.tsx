import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'

interface Ipo {
  company: string
  ticker?: string
  price?: number
  date?: string
  status?: string
}

export default function IposPage() {
  const { t } = useTranslation()

  const { data: ipos, isLoading } = useQuery({
    queryKey: ['ipos'],
    queryFn: async () => {
      const res = await api.get('/api/v1/ipos/upcoming')
      return res.data as Ipo[]
    },
  })

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('ipos.title')}</h2>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : ipos && ipos.length > 0 ? (
        <div className="grid gap-4">
          {ipos.map((ipo, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{ipo.company}</h3>
                  {ipo.ticker && (
                    <span className="text-sm font-mono text-primary">{ipo.ticker}</span>
                  )}
                </div>
                <div className="text-right">
                  {ipo.price && <p className="font-bold">₺{ipo.price.toFixed(2)}</p>}
                  {ipo.date && <p className="text-xs text-muted-foreground">{ipo.date}</p>}
                  {ipo.status && <Badge variant="secondary">{ipo.status}</Badge>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            {t('common.noData')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
