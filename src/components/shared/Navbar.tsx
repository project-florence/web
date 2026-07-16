import { useTranslation } from 'react-i18next'

export function Navbar() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">{t('app.name')}</h1>
    </header>
  )
}
