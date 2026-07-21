import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StockSearch } from '@/components/shared/StockSearch'
import { CreditCostTooltip } from '@/components/shared/CreditCostTooltip'
import { cn } from '@/lib/utils'
import { Target, FlaskConical, BarChart3, Coins, TrendingUp } from 'lucide-react'
import api from '@/lib/api'
import type { CompanyInfo, SimulationResponse, PerDayCostResponse, Credits } from '@/types/api'

export default function SimulationPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()

  const [ticker, setTicker] = useState(searchParams.get('ticker') || '')
  const [days, setDays] = useState(30)
  const [target, setTarget] = useState('')
  const [bounds, setBounds] = useState('0.05')
  const [run, setRun] = useState(false)

  const { data: info } = useQuery({
    queryKey: ['company-info', ticker],
    queryFn: async () => {
      const res = await api.get(`/api/v1/companies/info/${ticker}`)
      return res.data as CompanyInfo
    },
    enabled: !!ticker,
    staleTime: 5 * 60_000,
  })

  const { data: result, isLoading, error } = useQuery({
    queryKey: ['simulation', ticker, days, target, bounds],
    queryFn: async () => {
      const params: Record<string, string | number> = { days }
      if (target) params.target = target
      if (bounds) params.bounds = bounds
      const res = await api.get(`/api/v1/simulations/${ticker}`, { params })
      return res.data as SimulationResponse
    },
    enabled: run && !!ticker,
  })

  useEffect(() => {
    if (result) {
      queryClient.invalidateQueries({ queryKey: ['credits'] })
    }
  }, [result, queryClient])

  const { data: perDayCostData, error: costError } = useQuery({
    queryKey: ['per-day-cost'],
    queryFn: async () => {
      const res = await api.get('/api/v1/simulations/per-day-cost')
      return res.data as PerDayCostResponse
    },
    staleTime: Infinity,
    retry: 2,
  })

  if (costError) {
    console.error('[SimulationPage] per-day-cost query failed:', costError)
  }

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const res = await api.get('/api/v1/credits')
      return res.data as Credits
    },
    staleTime: 30_000,
  })

  const simulationCost = perDayCostData
    ? Number((days * perDayCostData.per_day_cost).toFixed(perDayCostData.round))
    : 0

  const insufficientCredits = credits !== undefined && simulationCost > credits.credits

  const currentPrice = info?.market.currentPrice

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('simulation.title')}</h2>

      <StockSearch
        onSelect={(t) => { setTicker(t); setRun(false) }}
        placeholder="Hisse seçin..."
      />

      {ticker && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-primary text-lg">{ticker}</span>
              {currentPrice && (
                <span className="text-sm text-muted-foreground">
                  Güncel: <span className="font-semibold text-foreground">₺{currentPrice.toFixed(2)}</span>
                </span>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Vade: {days} gün
              </label>
              <input
                type="range"
                min={1}
                max={365}
                value={days}
                onChange={(e) => { setDays(Number(e.target.value)); setRun(false) }}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>1 gün</span>
                <span>365 gün</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Hedef Fiyat (opsiyonel)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₺</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={currentPrice ? `Otomatik: ₺${(currentPrice * 1.1).toFixed(2)}` : 'Otomatik (güncel+%10)'}
                  value={target}
                  onChange={(e) => { setTarget(e.target.value); setRun(false) }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-7"
                />
              </div>
              {currentPrice && (
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 0.7).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    -%30
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 0.8).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    -%20
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 0.9).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    -%10
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 1.1).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    +%10
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 1.2).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    +%20
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTarget((currentPrice * 1.3).toFixed(2)); setRun(false) }}
                    className="text-sm px-2.5 py-1 rounded-md border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors"
                  >
                    +%30
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Güven Aralığı
              </label>
              <Select value={bounds} onValueChange={(v) => { if (v) { setBounds(v); setRun(false) } }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.05">%90 (varsayılan)</SelectItem>
                  <SelectItem value="0.025">%95</SelectItem>
                  <SelectItem value="0.005">%99</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <CreditCostTooltip cost={simulationCost}>
              {insufficientCredits ? (
                <Button
                  variant="outline"
                  className="w-full h-10 border-destructive/50 text-destructive cursor-not-allowed"
                  disabled
                >
                  <FlaskConical className="h-4 w-4 mr-2 shrink-0" />
                  <span className="mr-1">{t('simulation.calculate')}</span>
                  <span className="text-xs">🪙 {simulationCost.toFixed(3)}</span>
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  className="w-full h-10"
                  onClick={() => setRun(true)}
                >
                  <FlaskConical className="h-4 w-4 mr-2 shrink-0" />
                  <span className="mr-1">{t('simulation.calculate')}</span>
                  <span className="text-xs opacity-80">🪙 {perDayCostData ? simulationCost.toFixed(3) : '—'}</span>
                </Button>
              )}
            </CreditCostTooltip>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {error && !isLoading && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-destructive">Simülasyon sırasında bir hata oluştu.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-3 animate-fadeIn">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Olasılık</span>
              </div>
              {(() => {
                const targetNum = result.target && result.target !== 'auto' ? Number(result.target) : null
                const isAboveTarget = !targetNum || (currentPrice !== undefined && targetNum >= currentPrice)
                const dp = isAboveTarget ? result.prob_above : result.prob_below
                const pct = dp * 100
                const labelDir = isAboveTarget ? 'ulaşma' : 'altına inme'
                const good = isAboveTarget ? dp >= 0.7 : dp <= 0.3
                const bad = isAboveTarget ? dp <= 0.3 : dp >= 0.7
                const color = good ? 'text-success' : bad ? 'text-destructive' : 'text-amber-500'
                const bar = good ? 'bg-success' : bad ? 'bg-destructive' : 'bg-amber-500'
                return (
                  <>
                    <div className="text-center">
                      <span className={cn('text-3xl font-bold', color)}>
                        %{pct.toFixed(2)}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.target ? `₺${result.target}` : 'Otomatik hedef'} fiyatına {result.days} günde {labelDir} olasılığı
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-500', bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">%{Math.round(result.confidence.percent * 100)} Güven Aralığı</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Alt</p>
                  <p className="text-xl font-bold text-destructive">₺{result.confidence.min.toFixed(2)}</p>
                </div>
                <div className="h-10 w-px bg-border" />
                <div>
                  <p className="text-xs text-muted-foreground">Üst</p>
                  <p className="text-xl font-bold text-success">₺{result.confidence.max.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                bounds: {result.bounds} · {result.days} gün
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="text-muted-foreground">Harcanan</span>
                </div>
                <span className="font-mono font-semibold">{result.credits_spend.toFixed(2)} 🪙</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kalan</span>
                <span className="font-mono font-semibold">{result.remaining_credits.toFixed(2)} 🪙</span>
              </div>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            className="w-full h-10"
            onClick={() => navigate(`/stocks/${result.ticker}`)}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {result.ticker} Hisse Detayı
          </Button>
        </div>
      )}
    </div>
  )
}
