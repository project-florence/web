import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import type { ScoutResult } from '@/types/api'

export default function ScoutPage() {
  const { t } = useTranslation()
  const [budget, setBudget] = useState('100000')
  const [horizon, setHorizon] = useState('medium')
  const [risk, setRisk] = useState('medium')
  const [run, setRun] = useState(false)

  const { data: results, isLoading } = useQuery({
    queryKey: ['scout', budget, horizon, risk],
    queryFn: async () => {
      const res = await api.get('/api/v1/scout/best-tickers', {
        params: {
          investment_budget: Number(budget),
          investment_horizon: horizon,
          risk_tolerance: risk,
        },
      })
      return res.data as ScoutResult[]
    },
    enabled: run,
  })

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('scout.title')}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t('scout.analyze')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('scout.budget')} (₺)</label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('scout.horizon')}</label>
              <Select value={horizon} onValueChange={(v) => v && setHorizon(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">{t('scout.shortTerm')}</SelectItem>
                  <SelectItem value="medium">{t('scout.mediumTerm')}</SelectItem>
                  <SelectItem value="long">{t('scout.longTerm')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('scout.riskTolerance')}</label>
              <Select value={risk} onValueChange={(v) => v && setRisk(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t('scout.low')}</SelectItem>
                  <SelectItem value="medium">{t('scout.medium')}</SelectItem>
                  <SelectItem value="high">{t('scout.high')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => setRun(true)} className="w-full">{t('scout.analyze')}</Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{t('scout.results')}</h3>
          {results.map((result, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-primary">{result.ticker}</span>
                    <Badge variant="secondary">Skor: {result.score.toFixed(1)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.reason}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
