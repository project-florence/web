import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Coins } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import type { Credits } from '@/types/api'

export function CreditCostTooltip({
  cost,
  children,
}: {
  cost: number
  children: React.ReactNode
}) {
  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: async () => {
      const res = await api.get('/api/v1/credits')
      return res.data as Credits
    },
    staleTime: 30_000,
  })

  return (
    <Tooltip>
      <TooltipTrigger>
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">
        <div className="flex items-center gap-1.5 text-xs">
          <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          {cost.toFixed(2)} 🪙 harcanır · Kalan: {credits?.credits?.toFixed(2) ?? '—'}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
