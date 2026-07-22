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

const CX = 100
const CY = 110
const RADIUS = 90
const STROKE_W = 14

export function RecommendationsGauge({ data }: { data: Recommendation }) {
  const { t } = useTranslation()

  const total = data.strongBuy + data.buy + data.hold + data.sell + data.strongSell
  if (total === 0) return null

  const score = (data.strongBuy * 2 + data.buy * 1 + data.hold * 0 + data.sell * -1 + data.strongSell * -2) / total
  const normalized = (score + 2) / 4
  const angleDeg = 180 + normalized * 180
  const angleRad = (angleDeg * Math.PI) / 180

  const pX = (r: number) => CX + r * Math.cos(angleRad)
  const pY = (r: number) => CY + r * Math.sin(angleRad)

  const arcStart = 180
  const arcEnd = 360
  const tickCount = 5

  const tickAngles = Array.from({ length: tickCount }, (_, i) =>
    arcStart + (i / (tickCount - 1)) * (arcEnd - arcStart),
  )

  const needleLen = RADIUS - STROKE_W - 8
  const tipX = pX(needleLen)
  const tipY = pY(needleLen)

  const labelMap: Record<string, string> = {
    strongSell: 'SF',
    sell: 'S',
    hold: 'H',
    buy: 'B',
    strongBuy: 'BF',
  }

  return (
    <Card>
      <CardContent className="p-5 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-1 self-start">
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

        <svg viewBox="0 0 200 140" className="w-full max-w-[200px]">
          <defs>
            <linearGradient id="gGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
          </defs>

          <path
            d={`M ${CX + (RADIUS - STROKE_W) * Math.cos((arcStart * Math.PI) / 180)} ${CY + (RADIUS - STROKE_W) * Math.sin((arcStart * Math.PI) / 180)} 
               A ${RADIUS - STROKE_W / 2} ${RADIUS - STROKE_W / 2} 0 0 1 
               ${CX + (RADIUS - STROKE_W) * Math.cos((arcEnd * Math.PI) / 180)} ${CY + (RADIUS - STROKE_W) * Math.sin((arcEnd * Math.PI) / 180)}`}
            fill="none"
            stroke="url(#gGrad)"
            strokeWidth={STROKE_W}
            strokeLinecap="round"
          />

          {tickAngles.map((a) => {
            const ar = (a * Math.PI) / 180
            const inner = RADIUS - STROKE_W - 5
            const outer = RADIUS + 3
            return (
              <line
                key={a}
                x1={CX + inner * Math.cos(ar)}
                y1={CY + inner * Math.sin(ar)}
                x2={CX + outer * Math.cos(ar)}
                y2={CY + outer * Math.sin(ar)}
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
            )
          })}

          {tickAngles.map((a, i) => {
            const ar = (a * Math.PI) / 180
            const labelR = RADIUS + 12
            return (
              <text
                key={a}
                x={CX + labelR * Math.cos(ar)}
                y={CY + labelR * Math.sin(ar)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[9px] font-mono"
              >
                {segments[i]?.label ?? ''}
              </text>
            )
          })}

          <line
            x1={CX}
            y1={CY}
            x2={tipX}
            y2={tipY}
            stroke="hsl(var(--foreground))"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          <circle cx={CX} cy={CY} r="6" fill="hsl(var(--foreground))" />
          <circle cx={CX} cy={CY} r="3" fill="hsl(var(--background))" />

          <text
            x={CX}
            y={CY + RADIUS + 30}
            textAnchor="middle"
            className="fill-foreground text-sm font-bold font-mono"
          >
            %{(normalized * 100).toFixed(0)}
          </text>
        </svg>

        <div className="flex gap-1.5 w-full mt-2">
          {segments.map((seg) => {
            const val = data[seg.key as keyof Recommendation] as number
            const pct = total > 0 ? (val / total) * 100 : 0
            return (
              <div key={seg.key} className="flex-1 text-center">
                <div className={cn('h-1.5 rounded-full', seg.color)} style={{ opacity: pct > 0 ? 1 : 0.15 }} />
                <p className={cn('text-[10px] font-semibold mt-0.5', seg.textColor)}>{val}</p>
                <p className="text-[8px] text-muted-foreground">{labelMap[seg.key]}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
