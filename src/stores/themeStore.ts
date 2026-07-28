import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { themes, type ThemeName, type ThemeDefinition } from '@/config/themes'
import { track } from '@/lib/telemetry'

const STORAGE_KEY = 'florence-theme'

function setCSSVariables(theme: ThemeDefinition) {
  const root = document.documentElement
  const c = theme.colors
  root.style.setProperty('--background', c.background)
  root.style.setProperty('--foreground', c.foreground)
  root.style.setProperty('--card', c.card)
  root.style.setProperty('--card-foreground', c.cardForeground)
  root.style.setProperty('--popover', c.popover)
  root.style.setProperty('--popover-foreground', c.popoverForeground)
  root.style.setProperty('--primary', c.primary)
  root.style.setProperty('--primary-foreground', c.primaryForeground)
  root.style.setProperty('--secondary', c.secondary)
  root.style.setProperty('--secondary-foreground', c.secondaryForeground)
  root.style.setProperty('--muted', c.muted)
  root.style.setProperty('--muted-foreground', c.mutedForeground)
  root.style.setProperty('--accent', c.accent)
  root.style.setProperty('--accent-foreground', c.accentForeground)
  root.style.setProperty('--success', c.success)
  root.style.setProperty('--success-foreground', c.successForeground)
  root.style.setProperty('--warning', c.warning)
  root.style.setProperty('--warning-foreground', c.warningForeground)
  root.style.setProperty('--destructive', c.destructive)
  root.style.setProperty('--destructive-foreground', c.destructiveForeground)
  root.style.setProperty('--border', c.border)
  root.style.setProperty('--input', c.input)
  root.style.setProperty('--ring', c.ring)
  root.style.setProperty('--chart-1', c.chart1)
  root.style.setProperty('--chart-2', c.chart2)
  root.style.setProperty('--chart-3', c.chart3)
  root.style.setProperty('--chart-4', c.chart4)
  root.style.setProperty('--chart-5', c.chart5)
  root.style.setProperty('--sidebar', c.sidebar)
  root.style.setProperty('--sidebar-foreground', c.sidebarForeground)
  root.style.setProperty('--sidebar-primary', c.sidebarPrimary)
  root.style.setProperty('--sidebar-primary-foreground', c.sidebarPrimaryForeground)
  root.style.setProperty('--sidebar-accent', c.sidebarAccent)
  root.style.setProperty('--sidebar-accent-foreground', c.sidebarAccentForeground)
  root.style.setProperty('--sidebar-border', c.sidebarBorder)
  root.style.setProperty('--sidebar-ring', c.sidebarRing)
  if (theme.mode === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

interface ThemeState {
  themeName: ThemeName
  applyTheme: (name: ThemeName) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeName: 'florence' as ThemeName,
      applyTheme: (name: ThemeName) => {
        const theme = themes[name]
        if (theme) {
          const prev = document.documentElement.getAttribute('data-theme')
          setCSSVariables(theme)
          set({ themeName: name })
          track('theme_change', { from: prev, to: name })
        }
      },
    }),
    {
      name: STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state?.themeName) {
          const theme = themes[state.themeName]
          if (theme) setCSSVariables(theme)
        }
      },
    },
  ),
)
