import type { ComponentType } from 'react'

export interface WidgetLayout {
  id: string
  type: string
  x: number
  y: number
  w: number
  h: number
  config?: Record<string, unknown>
}

export interface DashboardLayout {
  layout: WidgetLayout[]
}

export type WidgetComponent = ComponentType<{ config?: Record<string, unknown> }>

export const WIDGET_TYPES = {
  WELCOME_HERO: 'welcome_hero',
  FAVORITES_BAR: 'favorites_bar',
  STAT_CARD: 'stat_card',
  MACROECONOMY: 'macroeconomy',
} as const

export const DEFAULT_LAYOUT: DashboardLayout = {
  layout: [
    { id: 'welcome', type: WIDGET_TYPES.WELCOME_HERO, x: 0, y: 0, w: 12, h: 2 },
    { id: 'favorites', type: WIDGET_TYPES.FAVORITES_BAR, x: 0, y: 2, w: 12, h: 3 },
    { id: 'gold', type: WIDGET_TYPES.STAT_CARD, x: 0, y: 5, w: 4, h: 2, config: { titleKey: 'dashboard.gold', dataSource: 'gold' } },
    { id: 'usd', type: WIDGET_TYPES.STAT_CARD, x: 4, y: 5, w: 4, h: 2, config: { titleKey: 'dashboard.usd', dataSource: 'currency', pair: 'USD' } },
    { id: 'eur', type: WIDGET_TYPES.STAT_CARD, x: 8, y: 5, w: 4, h: 2, config: { titleKey: 'dashboard.eur', dataSource: 'currency', pair: 'EUR' } },
    { id: 'macro', type: WIDGET_TYPES.MACROECONOMY, x: 0, y: 7, w: 12, h: 3 },
  ],
}
