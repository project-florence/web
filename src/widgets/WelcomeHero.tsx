import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StockSearch } from '@/components/shared/StockSearch'
import { BarChart3, Search, FlaskConical, TrendingUp } from 'lucide-react'
import api from '@/lib/api'

function getGreeting(h: number): string {
  if (h < 6) return 'İyi geceler'
  if (h < 12) return 'Günaydın'
  if (h < 18) return 'İyi günler'
  if (h < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

function getGreetingEmoji(h: number): string {
  if (h < 6) return '🌙'
  if (h < 12) return '☀️'
  if (h < 18) return '🌤️'
  if (h < 22) return '🌅'
  return '🌙'
}

export default function WelcomeHero() {
  const navigate = useNavigate()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/api/v1/profile')
      return res.data as { username: string; email: string; credits: number }
    },
    staleTime: 5 * 60_000,
  })

  const hour = now.getHours()
  const greeting = getGreeting(hour)
  const emoji = getGreetingEmoji(hour)
  const username = profile?.username ?? ''

  return (
    <div className="flex gap-4 items-start flex-col sm:flex-row">
      <Card className="flex-1 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent border-primary/10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{emoji}</span>
                <h3 className="text-lg font-semibold">
                  {greeting}{username ? `, ${username}!` : '!'}
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground shrink-0 pt-1">
              <span className="text-sm tabular-nums">
                {now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="mb-5">
            <StockSearch
              onSelect={(ticker) => navigate(`/stocks/${ticker}`)}
              placeholder="Hisse senedi ara"
              autoFocus={false}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="gradient" size="sm" onClick={() => navigate('/simulation')}>
              <FlaskConical className="h-4 w-4 mr-1.5" />
              Simülasyon
            </Button>
            <Button variant="gradient" size="sm" onClick={() => navigate('/advisor')}>
              <Search className="h-4 w-4 mr-1.5" />
              Danışman
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/stocks')}>
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Piyasalar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
              <BarChart3 className="h-4 w-4 mr-1.5" />
              Raporlar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
