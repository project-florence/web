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
import type { AxiosError } from 'axios'
import bgImage from '@/assets/background/login_background.png'

const registerSchema = z.object({
  username: z.string().min(3, 'En az 3 karakter'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'En az 6 karakter'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      await api.post('/api/v1/auth/register', data)
      toast.success(t('auth.registerSuccess'))
      navigate('/login', { replace: true })
    } catch (err) {
      const error = err as AxiosError<{ detail: string }>
      toast.error(error.response?.data?.detail || t('auth.registerError'))
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
            <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mb-4 shadow-lg shadow-primary/20 animate-pulse-glow">
              <span className="text-primary-foreground font-bold text-xl">F</span>
            </div>
            <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
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
                  type="email"
                  placeholder={t('auth.email')}
                  className="transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-primary/30"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
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
                {loading ? t('common.loading') : t('auth.register')}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary hover:underline">
                {t('auth.login')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
