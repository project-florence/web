import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Globe, ArrowLeft, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HyperspaceBackground } from '@/components/shared/HyperspaceBackground'
import api from '@/lib/api'
import type { AxiosError } from 'axios'
import florenceLogo from '@/assets/florence_logo.svg'

type ForgotForm = z.infer<ReturnType<typeof forgotSchema>>

function forgotSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
  })
}

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema(t)),
  })

  const formValues = watch()
  const formFilled = formValues.email?.trim()

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true)
    try {
      await api.post('/api/v1/auth/forgot-password', { email: data.email })
      setSent(true)
    } catch (err) {
      const error = err as AxiosError
      toast.error(error.response ? t('auth.serverError') : t('auth.networkError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-dvh flex items-center justify-center bg-background p-4 overflow-hidden">
      <HyperspaceBackground hyperdriveTriggered={false} onHyperdriveComplete={() => {}} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/10 to-background/30 backdrop-blur-[1px]" />
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('auth.loginLink')}
        </Button>
      </div>
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        <Card className="w-full bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl animate-slideUp">
          <CardHeader className="text-center">
            <img src={florenceLogo} alt="Florence" className="mx-auto h-14 w-14 mb-4" />
            <CardTitle className="text-2xl">{t('auth.forgotTitle')}</CardTitle>
            <CardDescription>{t('app.tagline')}</CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <MailCheck className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">{t('auth.forgotSent')}</p>
                <Button variant="gradient" className="w-full" onClick={() => navigate('/login')}>
                  {t('auth.loginLink')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder={t('auth.forgotEmail')}
                    className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" variant="gradient" className="w-full" disabled={loading || !formFilled}>
                  {loading ? t('common.loading') : t('auth.forgotSubmit')}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">
                {t('auth.register')}
              </Link>
            </p>

            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={i18n.language} onValueChange={(v) => v && i18n.changeLanguage(v)}>
                <SelectTrigger className="w-32">
                  <span>{i18n.language === 'tr' ? 'Türkçe' : 'English'}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
