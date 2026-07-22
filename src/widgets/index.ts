import { type ComponentType } from 'react'
import WelcomeHero from './WelcomeHero'
import FavoritesBar from './FavoritesBar'
import StatCardWidget from './StatCardWidget'
import MacroeconomyWidget from './MacroeconomyWidget'

export type WidgetComponent = ComponentType<{ config?: Record<string, unknown> }>

export const WIDGET_MAP: Record<string, WidgetComponent> = {
  welcome_hero: WelcomeHero,
  favorites_bar: FavoritesBar,
  stat_card: StatCardWidget,
  macroeconomy: MacroeconomyWidget,
}
