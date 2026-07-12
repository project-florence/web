import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type Time } from 'lightweight-charts'
import type { PriceHistory } from '@/types/api'
import { themeConfig } from '@/config/theme'

interface StockChartProps {
  data: PriceHistory[]
  loading?: boolean
}

export function StockChart({ data, loading }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: themeConfig.charts.textColor,
      },
      grid: {
        vertLines: { color: themeConfig.charts.gridColor },
        horzLines: { color: themeConfig.charts.gridColor },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: themeConfig.charts.crosshairColor, width: 1, style: 2 },
        horzLine: { color: themeConfig.charts.crosshairColor, width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: themeConfig.charts.gridColor,
      },
      timeScale: {
        borderColor: themeConfig.charts.gridColor,
        timeVisible: false,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      width: containerRef.current.clientWidth,
      height: 400,
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: themeConfig.charts.upColor,
      downColor: themeConfig.charts.downColor,
      borderUpColor: themeConfig.charts.upColor,
      borderDownColor: themeConfig.charts.downColor,
      wickUpColor: themeConfig.charts.upColor,
      wickDownColor: themeConfig.charts.downColor,
    })

    chartRef.current = chart
    seriesRef.current = series

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth })
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || !data.length) return

    const candleData: CandlestickData[] = data.map((d) => ({
      time: (new Date(d.ts).getTime() / 1000) as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))

    seriesRef.current.setData(candleData)
    chartRef.current?.timeScale().fitContent()
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px] rounded-lg bg-muted/20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[400px] rounded-lg bg-muted/20 text-muted-foreground">
        Veri bulunamadı
      </div>
    )
  }

  return <div ref={containerRef} className="w-full rounded-lg" />
}
