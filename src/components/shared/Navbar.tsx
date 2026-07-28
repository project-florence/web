import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import florenceLogo from '@/assets/florence_logo.svg'
import { useNavStore } from '@/stores/navStore'

export function Navbar() {
  const { t } = useTranslation()
  const mobileSidebarOpen = useNavStore((s) => s.mobileSidebarOpen)
  const toggleMobileSidebar = useNavStore((s) => s.toggleMobileSidebar)

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <img src={florenceLogo} alt="Florence" className="h-7 w-7" />
        <h1 className="text-lg font-semibold">{t('app.name')}</h1>
      </div>
    </header>
  )
}
