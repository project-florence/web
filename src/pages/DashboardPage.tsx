import { useTranslation } from 'react-i18next'
import { DashboardGrid } from '@/components/shared/DashboardGrid'
import { usePageTitle } from '@/hooks/usePageTitle'
import { DEFAULT_LAYOUT } from '@/types/widget'
import type { WidgetLayout } from '@/types/widget'

export default function DashboardPage() {
  const { t } = useTranslation()
  usePageTitle(t('dashboard.title'))

  // Layout editing was removed; every user sees the same DEFAULT_LAYOUT
  // (which includes the market digest widget). Ignore any stale saved layout.
  const layout: WidgetLayout[] = DEFAULT_LAYOUT.layout

  return (
    <div className="space-y-6 overflow-x-hidden">
      <DashboardGrid layout={layout} editing={false} />
    </div>
  )
}
