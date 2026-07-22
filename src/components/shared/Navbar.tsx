import { useTranslation } from 'react-i18next'
import florenceLogo from '@/assets/florence_logo.svg'

export function Navbar() {
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <img src={florenceLogo} alt="Florence" className="h-7 w-7" />
        <h1 className="text-lg font-semibold">{t('app.name')}</h1>
      </div>
    </header>
  )
}
