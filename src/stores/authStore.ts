import { create } from 'zustand'
import api from '@/lib/api'

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  checkAuth: () => Promise<void>
  setAuthenticated: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loading: true,
  checkAuth: async () => {
    try {
      await api.get('/api/v1/profile')
      set({ isAuthenticated: true, loading: false })
    } catch {
      set({ isAuthenticated: false, loading: false })
    }
  },
  setAuthenticated: (value) => set({ isAuthenticated: value, loading: false }),
  logout: () => set({ isAuthenticated: false }),
}))
