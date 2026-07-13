import { create } from 'zustand'

interface NavState {
  lastStockTicker: string | null
  stocksPage: number
  setLastStockTicker: (ticker: string | null) => void
  setStocksPage: (page: number) => void
}

export const useNavStore = create<NavState>((set) => ({
  lastStockTicker: null,
  stocksPage: 1,
  setLastStockTicker: (ticker) => set({ lastStockTicker: ticker }),
  setStocksPage: (page) => set({ stocksPage: page }),
}))
