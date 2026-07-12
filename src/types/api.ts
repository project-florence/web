export interface UserRegister {
  username: string
  email: string
  password: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface BistCompany {
  symbol: string
  name: string
  sector?: string
  price?: number
  change?: number
  volume?: number
}

export interface CompanyInfo {
  symbol: string
  name: string
  sector: string
  market: string
  website?: string
  description?: string
}

export interface PriceHistory {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  title: string
  summary: string
  source: string
  url: string
  date: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface SimulationResult {
  ticker: string
  probability: number
  target: number
  days: number
  results: Array<{ value: number; probability: number }>
}

export interface ConfidenceInterval {
  lower: number
  upper: number
  confidence: number
  days: number
}

export interface EconomyData {
  gold: { price: number; change: number }
  silver: { price: number; change: number }
  usd: { rate: number; change: number }
  eur: { rate: number; change: number }
}

export interface ScoutRequest {
  investment_budget: number
  investment_horizon: string
  risk_tolerance: string
}

export interface ScoutResult {
  ticker: string
  score: number
  reason: string
}

export interface ReportResult {
  ticker: string
  summary: string
  analysis: string
  recommendation: string
}
