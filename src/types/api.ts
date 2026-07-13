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
  ticker: string
  name: string
  summary_page: string
  city: string
  auditor: string
  company_id: string
}

export interface CompanySummary {
  ticker: string
  name: string
  sector: string | null
  last_price: number | null
  change_pct: number | null
  day_high: number | null
  day_low: number | null
  volume: number | null
  market_cap: number | null
  currency: string | null
  price_updated_at: string | null
}

export interface SearchResult {
  name: string
  ticker: string
  company_id: string
}

export interface CompanyInfo {
  symbol: string
  name: string
  sector: string
  industry: string
  currency: string
  exchange: string
  market: {
    currentPrice: number
    marketCap: number
    dayHigh: number
    dayLow: number
    regularMarketVolume: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
  }
  valuation: {
    trailingPE: number
    forwardPE: number | null
    priceToBook: number
    dividendYield: number | null
    payoutRatio: number | null
    targetMeanPrice: number | null
    targetHighPrice: number | null
    targetLowPrice: number | null
  }
  financials: {
    totalRevenue: number
    grossProfits: number
    netIncomeToCommon: number
    profitMargins: number
    operatingMargins: number
    revenueGrowth: number
    earningsGrowth: number | null
    returnOnEquity: number
    ebitda: number
  }
  balanceSheet: {
    totalCash: number
    totalDebt: number
    debtToEquity: number
    currentRatio: number
  }
  description?: string
}

export interface PriceHistory {
  ts: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface NewsItem {
  url: string
  title: string
  lang: string
  date: string
}

export type ReportResult = string

export interface FavoritesResponse {
  favorites: string[]
}

export interface FavoriteActionResponse {
  message: string
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

export interface MarketQuote {
  price: number
  change: number
  changePercent: number
}
