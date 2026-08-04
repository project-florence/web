import { create } from 'zustand'
import axios from 'axios'
import api from '@/lib/api'

interface AuthState {
  isAuthenticated: boolean
  loading: boolean
  authError: boolean
  checkAuth: () => Promise<void>
  setAuthenticated: (value: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loading: true,
  authError: false,
  checkAuth: async () => {
    set({ loading: true, authError: false })
    try {
      await api.get('/api/v1/profile')
      set({ isAuthenticated: true, loading: false, authError: false })
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined
      if (status === 401 || status === 403) {
        set({ isAuthenticated: false, loading: false, authError: false })
      } else {
        set({ loading: false, authError: true })
      }
    }
  },
  setAuthenticated: (value) => set({ isAuthenticated: value, loading: false, authError: false }),
  logout: () => {
    void api.post('/api/v1/auth/logout').catch(() => undefined)
    set({ isAuthenticated: false, loading: false, authError: false })
  },
}))
