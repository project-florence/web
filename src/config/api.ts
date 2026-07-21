export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7055',
  timeout: 30000,
  tokenKey: 'florence_token',
} as const
