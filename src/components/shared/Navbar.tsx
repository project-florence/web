import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export function Navbar() {
  const { t, i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'tr' ? 'en' : 'tr'
    i18n.changeLanguage(next)
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">{t('app.name')}</h1>
      <Button variant="ghost" size="sm" onClick={toggleLanguage}>
        <Globe className="h-4 w-4 mr-2" />
        {i18n.language === 'tr' ? 'EN' : 'TR'}
      </Button>
    </header>
  )
}
