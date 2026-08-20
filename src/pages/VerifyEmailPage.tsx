import { useEffect, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Globe, ArrowLeft, Loader2, MailCheck, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HyperspaceBackground } from '@/components/shared/HyperspaceBackground'
import { useAuthStore } from '@/stores/authStore'
import api from '@/lib/api'
import type { AxiosError } from 'axios'
import florenceLogo from '@/assets/florence_logo.svg'

type VerifyStatus = 'verifying' | 'success' | 'error'

type ResendForm = z.infer<ReturnType<typeof resendSchema>>

function resendSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t('validation.emailInvalid')),
  })
}

export default function VerifyEmailPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<VerifyStatus>(token ? 'verifying' : 'error')
  const [resendLoading, setResendLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResendForm>({
    resolver: zodResolver(resendSchema(t)),
  })

  const formValues = watch()
  const formFilled = formValues.email?.trim()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const verify = async () => {
      try {
        await api.get('/api/v1/auth/verify-email', { params: { token } })
        if (!cancelled) setStatus('success')
      } catch {
        if (!cancelled) setStatus('error')
      }
    }
    void verify()
    return () => {
      cancelled = true
    }
  }, [token])

  const handleContinue = async () => {
    await useAuthStore.getState().checkAuth()
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true })
  }

  const onResend = async (data: ResendForm) => {
    setResendLoading(true)
    try {
      await api.post('/api/v1/auth/resend-verification', { email: data.email })
      toast.success(t('auth.verifyResendSent'))
    } catch (err) {
      const error = err as AxiosError
      toast.error(error.response ? t('auth.serverError') : t('auth.networkError'))
    } finally {
      setResendLoading(false)
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
            <CardTitle className="text-2xl">
              {status === 'success'
                ? t('auth.verifiedTitle')
                : status === 'error'
                  ? t('auth.verifyInvalidTitle')
                  : t('app.name')}
            </CardTitle>
            <CardDescription>{t('app.tagline')}</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'verifying' && (
              <div className="flex flex-col items-center justify-center gap-4 py-6">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t('auth.verifying')}</p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <MailCheck className="h-12 w-12 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">{t('auth.verifiedSuccess')}</p>
                <Button variant="gradient" className="w-full" onClick={handleContinue}>
                  {t('auth.verifiedContinue')}
                </Button>
                <p className="text-xs text-muted-foreground/70">{t('auth.verifiedClose')}</p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <ShieldAlert className="h-12 w-12 mx-auto text-destructive" />
                <p className="text-sm text-muted-foreground">{t('auth.verifyInvalidMsg')}</p>
                <form onSubmit={handleSubmit(onResend)} className="space-y-3 text-left">
                  <div>
                    <Input
                      type="email"
                      placeholder={t('auth.verifyResendEmail')}
                      className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={resendLoading || !formFilled}
                  >
                    {resendLoading ? t('common.loading') : t('auth.verifyResend')}
                  </Button>
                </form>
                <Link to="/login" className="inline-block text-sm text-primary hover:underline">
                  {t('auth.loginLink')}
                </Link>
              </div>
            )}

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