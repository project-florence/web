import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

export default function AnalysisPage() {
  const { t } = useTranslation()

  const [probTicker, setProbTicker] = useState('')
  const [probDays, setProbDays] = useState('30')
  const [probTarget, setProbTarget] = useState('')

  const [ciTicker, setCiTicker] = useState('')
  const [ciDays, setCiDays] = useState('30')
  const [ciBounds, setCiBounds] = useState('0.95')

  const [runProb, setRunProb] = useState(false)
  const [runCi, setRunCi] = useState(false)

  const { data: probResult, isLoading: probLoading } = useQuery({
    queryKey: ['probability', probTicker, probDays, probTarget],
    queryFn: async () => {
      const res = await api.get(`/api/v1/simulations/probability/${probTicker}`, {
        params: { days: Number(probDays), target: probTarget },
      })
      return res.data
    },
    enabled: runProb && !!probTicker && !!probTarget,
  })

  const { data: ciResult, isLoading: ciLoading } = useQuery({
    queryKey: ['confidence-interval', ciTicker, ciDays, ciBounds],
    queryFn: async () => {
      const res = await api.get(`/api/v1/simulations/confidence-interval/${ciTicker}`, {
        params: { days: Number(ciDays), bounds: ciBounds },
      })
      return res.data
    },
    enabled: runCi && !!ciTicker,
  })

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('analysis.title')}</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.probabilitySimulation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Hisse (örn: THYAO)" value={probTicker} onChange={(e) => setProbTicker(e.target.value.toUpperCase())} />
            <Input placeholder={t('analysis.days')} type="number" value={probDays} onChange={(e) => setProbDays(e.target.value)} />
            <Input placeholder={t('analysis.target')} type="number" step="0.01" value={probTarget} onChange={(e) => setProbTarget(e.target.value)} />
            <Button onClick={() => setRunProb(true)} className="w-full">{t('analysis.calculate')}</Button>
            {probLoading && <Skeleton className="h-20 w-full" />}
            {probResult && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-lg font-bold">{t('analysis.probability')}: %{(probResult.probability * 100).toFixed(2)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('analysis.confidenceInterval')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Hisse (örn: THYAO)" value={ciTicker} onChange={(e) => setCiTicker(e.target.value.toUpperCase())} />
            <Input placeholder={t('analysis.days')} type="number" value={ciDays} onChange={(e) => setCiDays(e.target.value)} />
            <Select value={ciBounds} onValueChange={(v) => v && setCiBounds(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.90">%90</SelectItem>
                <SelectItem value="0.95">%95</SelectItem>
                <SelectItem value="0.99">%99</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setRunCi(true)} className="w-full">{t('analysis.calculate')}</Button>
            {ciLoading && <Skeleton className="h-20 w-full" />}
            {ciResult && (
              <div className="p-4 bg-muted rounded-lg space-y-1">
                <p className="text-sm">Alt: ₺{ciResult.lower.toFixed(2)}</p>
                <p className="text-sm">Üst: ₺{ciResult.upper.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">%{(ciResult.confidence * 100).toFixed(0)} güven aralığı</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fiyat Geçmişi Sorgulama</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Fiyat geçmişi endpoint'i sayfa detayında kullanılıyor. İlerleyen aşamalarda buraya da görsel eklenebilir.</p>
        </CardContent>
      </Card>
    </div>
  )
}
