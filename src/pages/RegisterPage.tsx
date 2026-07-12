import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground font-bold">F</span>
          </div>
          <CardTitle className="text-2xl">{t('auth.register')}</CardTitle>
          <CardDescription>{t('app.tagline')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder={t('auth.username')}
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
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
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
  )
}
