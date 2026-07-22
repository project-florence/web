export interface UserPreferences {
  layout: 'default' | import('./widget').WidgetLayout[]
  theme: 'default' | string
  language: 'default' | string
}

export interface RateEntry {
  Buying: string
  Selling: string
  Type: string
  Change: string
}

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

export interface CompanySummaryResponse {
  data: CompanySummary[]
  total: number
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

export interface Recommendation {
  period: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
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
  trading: {
    beta: number
    sharesOutstanding: number
    floatShares: number
    averageVolume: number
    averageVolume10days: number
    fiftyDayAverage: number
    twoHundredDayAverage: number
    shortRatio: number | null
    heldPercentInsiders: number
    heldPercentInstitutions: number
  }
  valuation: {
    trailingPE: number
    forwardPE: number | null
    pegRatio: number
    priceToBook: number
    priceToSalesTrailing12Months: number
    enterpriseValue: number
    enterpriseToEbitda: number
    enterpriseToRevenue: number
    bookValue: number
    trailingEps: number
    forwardEps: number | null
    dividendYield: number | null
    payoutRatio: number | null
    targetMeanPrice: number | null
    targetHighPrice: number | null
    targetLowPrice: number | null
    recommendationKey: string
    numberOfAnalystOpinions: number
  }
  financials: {
    totalRevenue: number
    revenuePerShare: number
    revenueGrowth: number
    grossProfits: number
    grossMargins: number
    ebitda: number
    ebitdaMargins: number
    netIncomeToCommon: number
    profitMargins: number
    operatingMargins: number
    operatingCashflow: number
    freeCashflow: number
    earningsGrowth: number | null
    earningsQuarterlyGrowth: number | null
    returnOnEquity: number
    returnOnAssets: number
  }
  balanceSheet: {
    totalCash: number
    totalCashPerShare: number
    totalDebt: number
    debtToEquity: number
    currentRatio: number
    quickRatio: number
  }
  description?: string
  recommendations?: Recommendation[]
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

export interface ReportTypeInfo {
  type: string
  name_en: string
  name_tr: string
  description: string
  description_tr: string
  est_cost: number
}

export interface ReportInfo {
  quick_report: ReportTypeInfo
  deep_report: ReportTypeInfo
  token_cost_per_1k: number
}

export interface ReportHistoryItem {
  id: number
  ticker: string
  type: string
  title: string
  token_usage: { total: number; prompt: number; completion: number }
  created_at: string
}

export interface ReportSentiment {
  index: number
  url: string
  sentiment: string
  reasoning: string
}

export interface ReportDetail {
  report_id: number
  credits_spend: number
  remaining_credits: number
  about: string
  type: string
  title: string
  report: string
  sentiments: ReportSentiment[]
  token_usage: { prompt: number; completion: number; total: number }
  created_at: string
}

export interface IpoListItem {
  id: number
  slug: string
  title: string
  link: string
  date: string
  modified: string
}

export interface IpoDetail {
  slug: string
  ticker: string
  company_name: string
  info: Record<string, string>
  sections: Record<string, string>
  company: { city: string; founded: string }
  updated_at: string
}

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

export interface PerDayCostResponse {
  per_day_cost: number
  round: number
}

export interface SimulationHistoryItem {
  id: number
  ticker: string
  days: number
  bounds: string
  target: string | null
  cost: number
  created_at: string
}

export interface SimulationHistoryDetail {
  id: number
  ticker: string
  days: number
  bounds: string
  target: string | null
  result: {
    prob_above: number
    prob_below: number
    confidence: {
      min: number
      max: number
      percent: number
      days: number
      bounds: string
    }
  }
  cost: number
  created_at: string
}

export interface SimulationResponse {
  prob_above: number
  prob_below: number
  confidence: {
    min: number
    max: number
    percent: number
    days: number
    bounds: string
  }
  ticker: string
  days: number
  target: string | null
  bounds: string
  credits_spend: number
  remaining_credits: number
}

export interface StockFitResult {
  ticker: string
  vector: [number, number, number]
  score: number
  distance: number
}

export interface StockFitResponse {
  query: {
    horizon_target: number
    profitability_target: number
    risk_tolerance: number
  }
  results: StockFitResult[]
}

export interface PortfolioProfileStock {
  ticker: string
  vector: [number, number, number]
}

export interface PortfolioProfileResponse {
  avg_vector: [number, number, number]
  estimated_profile: {
    risk: string
    horizon: string
    profitability: string
  }
  portfolio: PortfolioProfileStock[]
  similar_stocks: StockFitResult[]
}

export interface MarketQuote {
  price: number
  change: number
  changePercent: number
}

export interface Profile {
  username: string
  email: string
  credits: number
}

export interface Credits {
  credits: number
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
}

export interface UpdateEmailPayload {
  new_email: string
  current_password: string
}

export interface UpdateUsernamePayload {
  new_username: string
  current_password: string
}
