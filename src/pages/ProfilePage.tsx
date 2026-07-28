import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { LogOut, User, Key, Download, Trash2, ArrowLeft, Settings, Palette, Globe } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { themes } from '@/config/themes'
import type { ThemeName } from '@/config/themes'
import { usePreferences } from '@/hooks/usePreferences'
import api from '@/lib/api'
import type { Profile } from '@/types/api'
import { CreditDisplay } from '@/components/shared/CreditDisplay'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const themeName = useThemeStore((s) => s.themeName)
  const applyTheme = useThemeStore((s) => s.applyTheme)
  const { save: savePrefs } = usePreferences()

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/api/v1/profile')
      return res.data as Profile
    },
  })

  const [newUsername, setNewUsername] = useState('')
  const [usernamePassword, setUsernamePassword] = useState('')

  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')

  const [curPassword, setCurPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [deletePassword, setDeletePassword] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const usernameMutation = useMutation({
    mutationFn: async () => {
      await api.put('/api/v1/auth/change-username', {
        new_username: newUsername,
        current_password: usernamePassword,
      })
    },
    onSuccess: () => {
      toast.success(t('profile.usernameChanged'))
      setNewUsername('')
      setUsernamePassword('')
    },
    onError: () => toast.error(t('common.error')),
  })

  const emailMutation = useMutation({
    mutationFn: async () => {
      await api.put('/api/v1/auth/change-email', {
        new_email: newEmail,
        current_password: emailPassword,
      })
    },
    onSuccess: () => {
      toast.success(t('profile.emailChanged'))
      setNewEmail('')
      setEmailPassword('')
    },
    onError: () => toast.error(t('common.error')),
  })

  const passwordMutation = useMutation({
    mutationFn: async () => {
      await api.put('/api/v1/auth/change-password', {
        current_password: curPassword,
        new_password: newPassword,
      })
    },
    onSuccess: () => {
      toast.success(t('profile.passwordChanged'))
      setCurPassword('')
      setNewPassword('')
    },
    onError: () => toast.error(t('common.error')),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await api.delete('/api/v1/auth/delete', {
        data: { current_password: deletePassword },
        headers: { 'Content-Type': 'application/json' },
      })
    },
    onSuccess: () => {
      toast.success('Hesap silindi')
      logout()
      navigate('/login', { replace: true })
    },
    onError: () => toast.error(t('common.error')),
  })

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full max-w-md" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">{t('profile.title')}</h2>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold">{profile?.username}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/5">
          <CardContent className="p-5">
            <CreditDisplay size="lg" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="w-full">
          <TabsTrigger value="account" className="flex-1">
            <User className="h-4 w-4 mr-2" />
            {t('profile.account')}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1">
            <Key className="h-4 w-4 mr-2" />
            {t('profile.security')}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            {t('profile.data')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            {t('profile.settings')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="account" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('profile.username')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder={profile?.username || t('profile.username')}
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={usernamePassword}
                onChange={(e) => setUsernamePassword(e.target.value)}
              />
              <Button
                variant="gradient"
                size="sm"
                disabled={!newUsername || !usernamePassword || usernameMutation.isPending}
                onClick={() => usernameMutation.mutate()}
              >
                {t('profile.saveUsername')}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('profile.email')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="email"
                placeholder={profile?.email || t('profile.email')}
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
              />
              <Button
                variant="gradient"
                size="sm"
                disabled={!newEmail || !emailPassword || emailMutation.isPending}
                onClick={() => emailMutation.mutate()}
              >
                {t('profile.saveEmail')}
              </Button>
            </CardContent>
          </Card>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-200"
              onClick={() => {
                logout()
                navigate('/login', { replace: true })
              }}
            >
              <LogOut className="h-4 w-4 mr-1.5" />
              {t('nav.logout')}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('profile.changePassword')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="password"
                placeholder={t('profile.currentPassword')}
                value={curPassword}
                onChange={(e) => setCurPassword(e.target.value)}
              />
              <Input
                type="password"
                placeholder={t('profile.newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                variant="gradient"
                disabled={!curPassword || !newPassword || passwordMutation.isPending}
                onClick={() => passwordMutation.mutate()}
              >
                {t('profile.changePassword')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t('profile.exportData')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('profile.exportDesc')}</p>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await api.get('/api/v1/user/export')
                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `florence-export-${new Date().toISOString().split('T')[0]}.json`
                    a.click()
                    URL.revokeObjectURL(url)
                  } catch {
                    toast.error(t('common.error'))
                  }
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('profile.exportData')}
              </Button>
            </CardContent>
          </Card>
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">{t('profile.deleteAccount')}</CardTitle>
              <p className="text-xs text-muted-foreground">{t('profile.deleteDesc')}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('profile.deleteAccount')}
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('profile.deleteAccount')}</DialogTitle>
                    <DialogDescription>
                      {t('profile.confirmDelete')}
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="password"
                    placeholder={t('profile.currentPassword')}
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      {t('common.cancel')}
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={!deletePassword || deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate()}
                    >
                      {t('profile.deleteAccount')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Tema</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(themes).map(([key, theme]) => {
                  const isActive = themeName === key
                  return (
                    <Card
                      key={key}
                      onClick={() => {
                        applyTheme(key as ThemeName)
                        savePrefs({ theme: key } as Record<string, unknown>)
                      }}
                      className={`cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                        isActive ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-1.5 mb-2">
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.colors.success }} />
                          <div className="h-5 w-5 rounded-full" style={{ backgroundColor: theme.colors.background, border: '1px solid ' + theme.colors.border }} />
                        </div>
                        <p className="text-sm font-medium">{theme.name}</p>
                        {isActive && (
                          <p className="text-xs text-primary mt-1">Aktif</p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">{t('profile.language')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Select value={i18n.language} onValueChange={(v) => {
                if (!v) return
                i18n.changeLanguage(v)
                savePrefs({ language: v } as Record<string, unknown>)
              }}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
