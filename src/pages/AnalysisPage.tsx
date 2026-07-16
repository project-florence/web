import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { StockSearch } from '@/components/shared/StockSearch'
import { ArrowLeft, Target, BarChart3 } from 'lucide-react'
import api from '@/lib/api'
import type { CompanyInfo } from '@/types/api'

type View = 'cards' | 'probability' | 'confidence'

export default function AnalysisPage() {
  const { t } = useTranslation()

  const [view, setView] = useState<View>('cards')
  const [ticker, setTicker] = useState('')
  const [days, setDays] = useState(30)
  const [target, setTarget] = useState('')
  const [bounds, setBounds] = useState('0.95')

  const [runProb, setRunProb] = useState(false)
  const [runCi, setRunCi] = useState(false)

  const { data: info, isLoading: infoLoading } = useQuery({
    queryKey: ['company-info', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/info/${ticker}`)
      return res.data as CompanyInfo
    },
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  })

  const { data: probResult, isLoading: probLoading, error: probError } = useQuery({
    queryKey: ['probability', ticker, days, target],
    queryFn: async () => {
      const res = await api.get(`/api/v1/simulations/probability/${ticker}`, {
        params: { days, target },
      })
      return res.data as { percent: number; ticker: string; days: number; target: string }
    },
    enabled: runProb && !!ticker && !!target,
  })

  const { data: ciResult, isLoading: ciLoading, error: ciError } = useQuery({
    queryKey: ['confidence-interval', ticker, days, bounds],
    queryFn: async () => {
      const res = await api.get(`/api/v1/simulations/confidence-interval/${ticker}`, {
        params: { days, bounds },
      })
      return res.data as { lower: number; upper: number; confidence: number; days: number }
    },
    enabled: runCi && !!ticker,
  })

  const currentPrice = info?.market.currentPrice

  const SimulationCard = ({
    id,
    icon: Icon,
    title,
    description,
    children,
  }: {
    id: View
    icon: typeof Target
    title: string
    description: string
    children?: React.ReactNode
  }) => {
    const isExpanded = view === id

    if (isExpanded) {
      return (
        <Card className="md:col-span-2 animate-slideUp">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <Button variant="ghost" size="sm" onClick={() => { setView('cards'); setRunProb(false); setRunCi(false) }}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {t('common.cancel')}
            </Button>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>
      )
    }

    return (
      <Card
        className="cursor-pointer hover:bg-muted/50 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
        onClick={() => setView(id)}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('analysis.title')}</h2>

      {view === 'cards' && (
        <div className="max-w-sm">
          <StockSearch
            onSelect={(t) => setTicker(t)}
            placeholder="Hisse seçin..."
          />
        </div>
      )}

      {ticker && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono font-bold text-primary text-lg">{ticker}</span>
          {infoLoading && <Skeleton className="h-5 w-20" />}
          {currentPrice && (
            <span className="text-sm text-muted-foreground">
              Güncel Fiyat: <span className="font-semibold text-foreground">₺{currentPrice.toFixed(2)}</span>
            </span>
          )}
          {view !== 'cards' && (
            <span className="text-xs text-muted-foreground">
              {days} gün
            </span>
          )}
        </div>
      )}

      {ticker && view === 'cards' && (
        <div className="max-w-md">
          <label className="text-sm font-medium mb-1 block">Gün Sayısı: {days}</label>
          <input
            type="range"
            min={1}
            max={100}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 gün</span>
            <span>100 gün</span>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <SimulationCard
          id="probability"
          icon={Target}
          title={t('analysis.probabilitySimulation')}
          description="Seçilen hissenin belirtilen gün içinde hedef fiyata ulaşma olasılığını Monte Carlo simülasyonu ile hesaplar."
        >
          <div className="space-y-4">
            <Input
              placeholder="Hedef fiyat (₺)"
              type="number"
              step="0.01"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
        <Button
          variant="gradient"
          onClick={() => setRunProb(true)}
          className="w-full"
          disabled={!target}
        >
          {t('analysis.calculate')}
        </Button>
            {probLoading && <Skeleton className="h-16 w-full" />}
            {probError && (
              <p className="text-sm text-destructive">Hesaplama sırasında bir hata oluştu.</p>
            )}
            {probResult && (
              <div className={cn(
                'p-4 rounded-lg border',
                probResult.percent >= 0.5
                  ? 'border-success bg-success/10'
                  : 'border-destructive bg-destructive/10',
              )}>
                <p className="text-2xl font-bold text-center">
                  %{(probResult.percent * 100).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground text-center mt-1">
                  {probResult.target}₺ hedefine {probResult.days} günde ulaşma olasılığı
                </p>
              </div>
            )}
          </div>
        </SimulationCard>

        <SimulationCard
          id="confidence"
          icon={BarChart3}
          title={t('analysis.confidenceInterval')}
          description="Seçilen hissenin belirtilen gün içinde hangi fiyat aralığında olacağını istatistiksel olarak tahmin eder."
        >
          <div className="space-y-4">
            <Select value={bounds} onValueChange={(v) => v && setBounds(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.90">%90</SelectItem>
                <SelectItem value="0.95">%95</SelectItem>
                <SelectItem value="0.99">%99</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="gradient"
              onClick={() => setRunCi(true)}
              className="w-full"
            >
              {t('analysis.calculate')}
            </Button>
            {ciLoading && <Skeleton className="h-16 w-full" />}
            {ciError && (
              <p className="text-sm text-destructive">Hesaplama sırasında bir hata oluştu.</p>
            )}
            {ciResult && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Alt</p>
                    <p className="text-xl font-bold text-destructive">₺{ciResult.lower.toFixed(2)}</p>
                  </div>
                  <div className="h-8 w-px bg-border" />
                  <div>
                    <p className="text-xs text-muted-foreground">Üst</p>
                    <p className="text-xl font-bold text-success">₺{ciResult.upper.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  %{(ciResult.confidence * 100).toFixed(0)} güven aralığı · {ciResult.days} gün
                </p>
              </div>
            )}
          </div>
        </SimulationCard>
      </div>
    </div>
  )
}
