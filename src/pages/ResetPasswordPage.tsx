import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Globe, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HyperspaceBackground } from '@/components/shared/HyperspaceBackground'
import api from '@/lib/api'
import { translateBackendDetail } from '@/lib/backendErrors'
import type { AxiosError } from 'axios'
import florenceLogo from '@/assets/florence_logo.svg'

type ResetForm = z.infer<ReturnType<typeof resetSchema>>

function resetSchema(t: (key: string) => string) {
  return z
    .object({
      newPassword: z.string().min(10, t('validation.passwordMin10')),
      confirmPassword: z.string().min(1, t('validation.passwordRequired')),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      path: ['confirmPassword'],
      message: t('auth.resetMismatch'),
    })
}

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema(t)),
  })

  const formValues = watch()
  const formFilled = formValues.newPassword?.trim() && formValues.confirmPassword?.trim()

  const onSubmit = async (data: ResetForm) => {
    if (!token) return
    setLoading(true)
    try {
      await api.post('/api/v1/auth/reset-password', {
        token,
        new_password: data.newPassword,
      })
      toast.success(t('auth.resetSuccess'))
      navigate('/login', { replace: true })
    } catch (err) {
      const error = err as AxiosError<{ detail: string | { msg: string }[] }>
      if (!error.response) {
        toast.error(t('auth.networkError'))
        return
      }
      if (error.response.status === 400) {
        toast.error(t('auth.resetInvalidToken'))
        return
      }
      const detail = error.response.data?.detail
      const mapped = translateBackendDetail(t, detail)
      const message = mapped || (Array.isArray(detail) ? detail[0]?.msg : detail)
      toast.error(message || t('auth.resetInvalidToken'))
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
            <CardTitle className="text-2xl">{t('auth.resetTitle')}</CardTitle>
            <CardDescription>{t('app.tagline')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">{t('auth.resetInvalidToken')}</p>
                <Button variant="gradient" className="w-full" onClick={() => navigate('/login')}>
                  {t('auth.loginLink')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetNewPassword')}
                    className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30 pr-9"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.newPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetConfirm')}
                    className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30 pr-9"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" variant="gradient" className="w-full" disabled={loading || !formFilled}>
                  {loading ? t('common.loading') : t('auth.resetSubmit')}
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