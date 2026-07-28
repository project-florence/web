export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  tokenKey: 'florence_token',
} as const
