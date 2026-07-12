import axios from 'axios'
import { apiConfig } from '@/config/api'

const api = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(apiConfig.tokenKey)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(apiConfig.tokenKey)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api
