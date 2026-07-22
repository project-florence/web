import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import type { AxiosError } from 'axios'
import bgImage from '@/assets/background/login_background.png'
import florenceLogo from '@/assets/florence_logo.svg'

const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gerekli'),
  password: z.string().min(1, 'Şifre gerekli'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setToken = useAuthStore((s) => s.setToken)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('grant_type', 'password')
      formData.append('username', data.username)
      formData.append('password', data.password)

      const res = await api.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      setToken(res.data.access_token)
      toast.success(t('auth.loginSuccess'))
      navigate('/', { replace: true })
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>
      if (!error.response) {
        toast.error(t('auth.networkError'))
      } else if (error.response.status >= 500) {
        toast.error(t('auth.serverError'))
      } else {
        toast.error(error.response.data?.detail || t('auth.loginError'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-background p-4 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        <Card className="w-full bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl animate-slideUp">
          <CardHeader className="text-center">
            <img src={florenceLogo} alt="Florence" className="mx-auto h-14 w-14 mb-4" />
            <CardTitle className="text-2xl">{t('app.name')}</CardTitle>
            <CardDescription>{t('app.tagline')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Input
                  placeholder={t('auth.username')}
                  className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
                )}
              </div>
              <div>
                <Input
                  type="password"
                  placeholder={t('auth.password')}
                  className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-primary hover:underline">
                {t('auth.register')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
