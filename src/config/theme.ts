export const themeConfig = {
  colors: {
    primary: '#2563eb',
    primaryForeground: '#ffffff',
    secondary: '#334155',
    secondaryForeground: '#f8fafc',
    accent: '#f59e0b',
    accentForeground: '#0f172a',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#0a0a0f',
    surface: '#1a1a2e',
    surfaceHover: '#252542',
    border: '#2d2d4a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  },
  charts: {
    upColor: '#22c55e',
    downColor: '#ef4444',
    gridColor: '#1e293b',
    textColor: '#94a3b8',
    crosshairColor: '#475569',
  },
  borderRadius: '0.5rem',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
} as const

export type FlorenceTheme = typeof themeConfig
