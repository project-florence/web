import { useTranslation } from 'react-i18next'
import { WIDGET_MAP } from '@/widgets'
import type { WidgetComponent } from '@/widgets'
import { DEFAULT_LAYOUT } from '@/types/widget'

export default function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>

      {DEFAULT_LAYOUT.layout.map((item) => {
        const Widget = WIDGET_MAP[item.type] as WidgetComponent | undefined
        if (!Widget) return null
        return <Widget key={item.id} config={item.config} />
      })}
    </div>
  )
}
