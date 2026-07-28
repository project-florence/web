import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type Time } from 'lightweight-charts'
import type { PriceHistory } from '@/types/api'
import { useThemeStore } from '@/stores/themeStore'
import { themes } from '@/config/themes'
import { AlertCircle } from 'lucide-react'

interface StockChartProps {
  data: PriceHistory[]
  loading?: boolean
  visibleRange?: { from: number; to: number }
}

export function StockChart({ data, loading, visibleRange }: StockChartProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const hasDataRef = useRef(false)
  const resizeHandlerRef = useRef<(() => void) | null>(null)
  const themeName = useThemeStore((s) => s.themeName)

  useEffect(() => {
    if (!containerRef.current) return

    const chars = themes[themeName].charts
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: chars.textColor,
      },
      grid: {
        vertLines: { color: chars.gridColor },
        horzLines: { color: chars.gridColor },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: chars.crosshairColor, width: 1, style: 2 },
        horzLine: { color: chars.crosshairColor, width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: chars.gridColor,
      },
      timeScale: {
        borderColor: chars.gridColor,
        timeVisible: false,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      width: containerRef.current.clientWidth,
      height: 400,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: chars.upColor,
      downColor: chars.downColor,
      borderUpColor: chars.upColor,
      borderDownColor: chars.downColor,
      wickUpColor: chars.upColor,
      wickDownColor: chars.downColor,
    })

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    resizeHandlerRef.current = handleResize
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
      chartRef.current = null
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeName])

  useEffect(() => {
    if (!seriesRef.current) return

    if (data.length > 0) {
      const valid = data.filter((d) => {
        const { open, high, low, close } = d
        return (
          open != null && high != null && low != null && close != null &&
          isFinite(open) && isFinite(high) && isFinite(low) && isFinite(close)
        )
      })

      if (valid.length > 0) {
        hasDataRef.current = true
        const candleData: CandlestickData[] = valid.map((d) => ({
          time: (new Date(d.ts).getTime() / 1000) as Time,
          open: d.open!,
          high: d.high!,
          low: d.low!,
          close: d.close!,
        }))
        try {
          seriesRef.current.setData(candleData)
          if (visibleRange) {
            chartRef.current?.timeScale().setVisibleRange({
              from: (visibleRange.from / 1000) as Time,
              to: (visibleRange.to / 1000) as Time,
            })
          } else {
            chartRef.current?.timeScale().fitContent()
          }
        } catch {
          console.warn('StockChart: setData failed')
        }
      }
    }
  }, [data, visibleRange])

  const hasValidData = data.some((d) => {
    const { open, high, low, close } = d
    return open != null && high != null && low != null && close != null &&
      isFinite(open) && isFinite(high) && isFinite(low) && isFinite(close)
  })
  const isEmpty = !hasValidData
  const neverHadData = !hasDataRef.current

  return (
    <div className="relative" style={{ height: 400 }}>
      <div ref={containerRef} className="w-full h-full rounded-lg" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">{t('chart.loading')}</span>
          </div>
        </div>
      )}
      {!loading && isEmpty && neverHadData && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/60">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">{t('chart.noData')}</span>
          </div>
        </div>
      )}
      {!loading && isEmpty && !neverHadData && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center gap-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-500">
            <AlertCircle className="h-3 w-3" />
            Yeni periyot için veri yok, önceki grafik gösteriliyor
          </div>
        </div>
      )}
    </div>
  )
}
