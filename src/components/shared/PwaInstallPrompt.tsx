import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
  }, [])

  if (!installEvent) return null

  const install = async () => {
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border border-primary/30 bg-card/95 p-3 shadow-xl backdrop-blur">
      <div className="min-w-0">
        <p className="text-sm font-medium">Florence’i yükle</p>
        <p className="text-xs text-muted-foreground">Daha hızlı erişim için ana ekrana ekle.</p>
      </div>
      <Button size="sm" onClick={() => void install()}>
        <Download className="mr-1.5 h-4 w-4" />
        Yükle
      </Button>
    </div>
  )
}
