import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, Search, Sparkles, Clock } from 'lucide-react'

export default function WelcomeHero() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex gap-4 items-start flex-col sm:flex-row">
      <Card className="flex-1 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
        <CardContent className="p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Hoş Geldiniz</h3>
            </div>
            <p className="text-sm text-muted-foreground">Piyasaları takip et, akıllı yatırım kararları al.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="gradient" size="sm" onClick={() => navigate('/stocks')}>
              <TrendingUp className="h-4 w-4 mr-1" />
              Hisse Ara
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/simulation')}>
              <BarChart3 className="h-4 w-4 mr-1" />
              Analiz Yap
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/advisor')}>
              <Search className="h-4 w-4 mr-1" />
              Danışman
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2 text-muted-foreground shrink-0 pt-2 sm:pt-6">
        <Clock className="h-4 w-4" />
        <span className="text-sm tabular-nums">
          {now.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <span className="text-sm font-semibold tabular-nums">
          {now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}
