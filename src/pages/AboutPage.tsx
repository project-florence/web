import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import api from '@/lib/api'

interface AboutResponse {
  lang: string
  content: string
}

export default function AboutPage() {
  const { t, i18n } = useTranslation()

  const { data, isLoading, error } = useQuery({
    queryKey: ['about', i18n.language],
    queryFn: async () => {
      const res = await api.get('/api/v1/about', { params: { lang: i18n.language } })
      return res.data as AboutResponse
    },
  })

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('footer.about')}</h1>
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/6" />
        </div>
      ) : error ? (
        <p className="text-sm text-destructive">{t('common.error')}</p>
      ) : (
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {data?.content}
        </div>
      )}
    </div>
  )
}
