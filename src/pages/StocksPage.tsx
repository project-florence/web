import { useState } from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import api from '@/lib/api'
import type { BistCompany } from '@/types/api'

export default function StocksPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')

  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await api.get('/api/v1/bist/companies')
      return res.data as BistCompany[]
    },
  })

  const filtered = companies?.filter(
    (c) =>
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.name?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('stocks.title')}</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('stocks.search')}
          className="pl-9 max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))
          : filtered?.map((company) => (
              <Link key={company.symbol} to={`/stocks/${company.symbol}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono font-bold text-primary">{company.symbol}</span>
                      {company.change !== undefined && (
                        <Badge
                          variant={company.change >= 0 ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {company.change >= 0 ? '+' : ''}{company.change.toFixed(2)}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{company.name}</p>
                    {company.price !== undefined && (
                      <p className="text-lg font-bold mt-1">₺{company.price.toFixed(2)}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
