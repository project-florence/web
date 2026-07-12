import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'

interface StockSearchProps {
  onSelect: (ticker: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

const TICKER_CACHE_MS = 30 * 24 * 60 * 60 * 1000

export function StockSearch({ onSelect, placeholder, className, autoFocus }: StockSearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: tickers } = useQuery({
    queryKey: ['tickers'],
    queryFn: async () => {
      const res = await api.get('/api/v1/bist/tickers')
      return res.data as string[]
    },
    staleTime: TICKER_CACHE_MS,
    gcTime: TICKER_CACHE_MS,
  })

  const filtered = tickers?.filter((t) =>
    t.toLowerCase().includes(query.toLowerCase()),
  ) ?? []

  const visible = filtered.slice(0, 20)

  useEffect(() => {
    setHighlightIndex(-1)
    setIsOpen(query.length > 0 && visible.length > 0)
  }, [query, visible.length])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const select = (ticker: string) => {
    setQuery('')
    setIsOpen(false)
    onSelect(ticker)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.min(prev + 1, visible.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      select(visible[highlightIndex])
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        placeholder={placeholder || 'Hisse ara...'}
        className="pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && visible.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
      />
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-popover p-1 shadow-lg"
        >
          {visible.map((ticker, i) => (
            <button
              key={ticker}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                i === highlightIndex
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
              onClick={() => select(ticker)}
              onMouseEnter={() => setHighlightIndex(i)}
            >
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono font-medium">{ticker}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
