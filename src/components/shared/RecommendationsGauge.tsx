import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Recommendation } from '@/types/api'

const segments = [
  { key: 'strongSell', label: 'Kuv. Sat', color: 'bg-destructive', textColor: 'text-destructive' },
  { key: 'sell', label: 'Sat', color: 'bg-orange-500', textColor: 'text-orange-500' },
  { key: 'hold', label: 'Tut', color: 'bg-muted-foreground', textColor: 'text-muted-foreground' },
  { key: 'buy', label: 'Al', color: 'bg-emerald-500', textColor: 'text-emerald-500' },
  { key: 'strongBuy', label: 'Kuv. Al', color: 'bg-green-600', textColor: 'text-green-600' },
] as const

const SVG_SIZE = 180
const CENTER = SVG_SIZE / 2
const RADIUS = 75
const STROKE = 12

export function RecommendationsGauge({ data }: { data: Recommendation }) {
  const { t } = useTranslation()

  const total = data.strongBuy + data.buy + data.hold + data.sell + data.strongSell
  if (total === 0) return null

  const score = (data.strongBuy * 2 + data.buy * 1 + data.hold * 0 + data.sell * -1 + data.strongSell * -2) / total
  const normalized = (score + 2) / 4
  const angle = -180 + normalized * 180

  const arcX = (r: number, a: number) => CENTER + r * Math.cos((a * Math.PI) / 180)
  const arcY = (r: number, a: number) => CENTER + r * Math.sin((a * Math.PI) / 180)

  const gradDefs = (
    <defs>
      <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="25%" stopColor="#f97316" />
        <stop offset="50%" stopColor="#a1a1aa" />
        <stop offset="75%" stopColor="#10b981" />
        <stop offset="100%" stopColor="#16a34a" />
      </linearGradient>
    </defs>
  )

  return (
    <Card>
      <CardContent className="p-5 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3 self-start">
          <span className="text-sm font-medium">Analist Önerileri</span>
          <Tooltip>
            <TooltipTrigger>
              <TriangleAlert className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {t('common.disclaimer')}
            </TooltipContent>
          </Tooltip>
        </div>

        <svg width={SVG_SIZE} height={SVG_SIZE / 2 + 20} viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE / 2 + 20}`}>
          {gradDefs}

          {Array.from({ length: 100 }).map((_, i) => {
            const a = -180 + (i / 99) * 180
            return (
              <line
                key={i}
                x1={arcX(RADIUS - STROKE, a)}
                y1={arcY(RADIUS - STROKE, a)}
                x2={arcX(RADIUS, a)}
                y2={arcY(RADIUS, a)}
                stroke={`hsl(${(i / 99) * 120}, 70%, 45%)`}
                strokeWidth="0.5"
                opacity="0.4"
              />
            )
          })}

          <path
            d={`M ${arcX(RADIUS - STROKE, -180)} ${arcY(RADIUS - STROKE, -180)} A ${RADIUS - STROKE} ${RADIUS - STROKE} 0 0 1 ${arcX(RADIUS - STROKE, 0)} ${arcY(RADIUS - STROKE, 0)}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {[-180, -135, -90, -45, 0].map((a) => (
            <line
              key={a}
              x1={arcX(RADIUS - STROKE - 4, a)}
              y1={arcY(RADIUS - STROKE - 4, a)}
              x2={arcX(RADIUS + 2, a)}
              y2={arcY(RADIUS + 2, a)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}

          <line
            x1={CENTER}
            y1={CENTER}
            x2={arcX(RADIUS - STROKE - 6, angle)}
            y2={arcY(RADIUS - STROKE - 6, angle)}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <circle cx={CENTER} cy={CENTER} r="5" fill="hsl(var(--foreground))" />

          <text x={CENTER} y={SVG_SIZE / 2 + 12} textAnchor="middle" className="fill-foreground text-[10px] font-mono font-bold">
            %{(normalized * 100).toFixed(0)}
          </text>
        </svg>

        <div className="flex gap-1.5 w-full mt-3">
          {segments.map((seg) => {
            const val = data[seg.key as keyof Recommendation] as number
            const pct = total > 0 ? (val / total) * 100 : 0
            return (
              <div key={seg.key} className="flex-1 text-center">
                <div className={cn('h-1.5 rounded-full', seg.color)} style={{ opacity: pct > 0 ? 1 : 0.15 }} />
                <p className={cn('text-[10px] font-semibold mt-1', seg.textColor)}>{val}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
