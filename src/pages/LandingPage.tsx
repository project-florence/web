import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Globe } from 'lucide-react'
import florenceLogo from '@/assets/florence_logo.svg'
import { FluidBackground } from '@/components/shared/FluidBackground'

const footerLinks = [
  { to: '/about', key: 'footer.about' },
  { to: '/contact', key: 'footer.contact' },
  { to: '/legal/terms', key: 'footer.terms' },
  { to: '/legal/privacy_policy', key: 'footer.privacy' },
  { to: '/legal/cookie_policy', key: 'footer.cookies' },
  { to: '/legal/disclaimer', key: 'footer.disclaimer' },
]

export default function LandingPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <FluidBackground />

      {/* Top navbar */}
      <header className="flex items-center justify-between px-4 md:px-8 h-16 relative z-10">
        <div className="flex items-center gap-2">
          <img src={florenceLogo} alt="Florence" className="h-8 w-8" />
          <span className="font-semibold text-lg">{t('app.name')}</span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={i18n.language} onValueChange={(v) => v && i18n.changeLanguage(v)}>
            <SelectTrigger className="w-28 h-9">
              <Globe className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate('/login')}>
            {t('auth.login')}
          </Button>
          <Button variant="gradient" onClick={() => navigate('/register')} className="hidden sm:inline-flex">
            {t('landing.signUp')}
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <Card className="w-full max-w-2xl bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl">
          <CardContent className="p-8 md:p-12 text-center space-y-8">
            <img src={florenceLogo} alt="Florence" className="h-16 w-16 mx-auto" />

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              {t('landing.heading')}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('landing.subheading')}
            </p>

            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => navigate('/register')}
                className="text-base px-10 py-6 h-auto rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold"
              >
                {t('landing.getStarted')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 px-4 md:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            {footerLinks.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-foreground hover:underline transition-colors">
                {t(link.key)}
              </Link>
            ))}
          </div>
          <div className="text-center text-[11px] text-muted-foreground/60 mt-3">
            &copy; 2026 Florence. {t('footer.allRightsReserved')}
          </div>
        </div>
      </footer>
    </div>
  )
}
