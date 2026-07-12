import { create } from 'zustand'
import { apiConfig } from '@/config/api'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  setToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem(apiConfig.tokenKey),
  isAuthenticated: !!localStorage.getItem(apiConfig.tokenKey),
  setToken: (token) => {
    localStorage.setItem(apiConfig.tokenKey, token)
    set({ token, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem(apiConfig.tokenKey)
    set({ token: null, isAuthenticated: false })
  },
}))
