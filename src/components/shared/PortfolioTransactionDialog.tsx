import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import api from '@/lib/api'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  portfolioId: string
  ticker: string
  type: 'BUY' | 'SELL'
  currentPrice?: number
}

export function PortfolioTransactionDialog({ open, onOpenChange, portfolioId, ticker, type, currentPrice }: Props) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState('')

  const qty = parseFloat(quantity) || 0
  const totalCost = currentPrice != null ? qty * currentPrice : null

  const mutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/portfolios/${portfolioId}/transactions`, {
        ticker,
        type,
        quantity: parseFloat(quantity),
      })
    },
    onSuccess: () => {
      toast.success(type === 'BUY' ? t('portfolio.buySuccess') : t('portfolio.sellSuccess'))
      queryClient.invalidateQueries({ queryKey: ['portfolios'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })
      queryClient.invalidateQueries({ queryKey: ['portfolio-valuation', portfolioId] })
      setQuantity('')
      onOpenChange(false)
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || t('common.error')
      toast.error(msg)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === 'BUY' ? t('portfolio.buy') : t('portfolio.sell')} — {ticker}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{t('portfolio.quantity')}</label>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
          {totalCost != null && totalCost > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Tahmini tutar</span>
              <span className="font-medium">{totalCost.toFixed(2)}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={type === 'BUY' ? 'gradient' : 'destructive'}
            disabled={!quantity || parseFloat(quantity) <= 0 || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {type === 'BUY' ? t('portfolio.buy') : t('portfolio.sell')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
