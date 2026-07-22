import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Gem } from 'lucide-react'
import { parseChange } from '@/lib/parse'
import api from '@/lib/api'
import type { RateEntry } from '@/types/api'

const METAL_NAMES: Record<string, string> = {
  ons: 'Ons Altın',
  'gram-altin': 'Gram Altın',
  'gram-has-altin': 'Gram Has Altın',
  'ceyrek-altin': 'Çeyrek Altın',
  'yarim-altin': 'Yarım Altın',
  'tam-altin': 'Tam Altın',
  'cumhuriyet-altini': 'Cumhuriyet Altını',
  'ata-altin': 'Ata Altın',
  '14-ayar-altin': '14 Ayar Altın',
  '18-ayar-altin': '18 Ayar Altın',
  '22-ayar-bilezik': '22 Ayar Bilezik',
  'ikibucuk-altin': 'İkibuçuk Altın',
  'gremse-altin': 'Gremse Altın',
  'resat-altin': 'Reşat Altın',
  'besli-altin': 'Beşli Altın',
  'hamit-altin': 'Hamit Altın',
  'gumus': 'Gümüş',
  'gram-palatin': 'Gram Palatin',
  'gram-platin': 'Gram Platin',
  'gram-paladyum': 'Gram Paladyum',
}

function MetalCard({ id, entry, index = 0 }: { id: string; entry: RateEntry; index?: number }) {
  const change = parseChange(entry.Change)
  return (
    <div className="animate-slideUp" style={{ animationDelay: `${(index % 12) * 60}ms` }}>
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{id.includes('altin') || id === 'ons' ? '🥇' : '🥈'}</span>
          <span className="font-medium text-sm">{METAL_NAMES[id] || id}</span>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alış</span>
            <span className="font-medium">{entry.Buying}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Satış</span>
            <span className="font-medium">{entry.Selling}</span>
          </div>
        </div>
        {change !== null && (
          <div className={cn(
            'flex items-center gap-1 mt-2 text-xs font-semibold',
            change >= 0 ? 'text-success' : 'text-destructive',
          )}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  )
}

export default function MetalsPage() {
  const { t } = useTranslation()

  const { data: gold, isLoading: goldLoading } = useQuery({
    queryKey: ['gold-all'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gold-prices')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: silver } = useQuery({
    queryKey: ['silver'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/silver-price')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: platinum } = useQuery({
    queryKey: ['platinum'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gram-platinum-price')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const { data: palladium } = useQuery({
    queryKey: ['palladium'],
    queryFn: async () => {
      const res = await api.get('/api/v1/economy/gram-palladium-price')
      return res.data as Record<string, RateEntry>
    },
    staleTime: 60_000,
  })

  const otherMetals = {
    ...(silver || {}),
    ...(platinum || {}),
    ...(palladium || {}),
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('nav.metals')}</h2>

      {goldLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <>
          {gold && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Gem className="h-4 w-4" /> Altın
              </h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Object.entries(gold).map(([id, entry], i) => (
                  <MetalCard key={id} id={id} entry={entry} index={i} />
                ))}
              </div>
            </div>
          )}
          {Object.keys(otherMetals).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Diğer Değerli Metaller</h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {Object.entries(otherMetals).map(([id, entry], i) => (
                  <MetalCard key={id} id={id} entry={entry} index={i + 14} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
