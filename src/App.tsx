import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Layout } from '@/components/shared/Layout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const StocksPage = lazy(() => import('@/pages/StocksPage'))
const StockDetailPage = lazy(() => import('@/pages/StockDetailPage'))
const WatchlistPage = lazy(() => import('@/pages/WatchlistPage'))
const SimulationPage = lazy(() => import('@/pages/SimulationPage'))
const AdvisorPage = lazy(() => import('@/pages/AdvisorPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const ReportDetailPage = lazy(() => import('@/pages/ReportDetailPage'))
const IposPage = lazy(() => import('@/pages/IposPage'))
const CurrencyPage = lazy(() => import('@/pages/CurrencyPage'))
const MetalsPage = lazy(() => import('@/pages/MetalsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2,
    },
  },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="stocks" element={<StocksPage />} />
                <Route path="stocks/:ticker" element={<StockDetailPage />} />
                <Route path="watchlist" element={<WatchlistPage />} />
                <Route path="simulation" element={<SimulationPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />
                <Route path="advisor" element={<AdvisorPage />} />
                <Route path="ipos" element={<IposPage />} />
                <Route path="currency" element={<CurrencyPage />} />
                <Route path="metals" element={<MetalsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
        />
      </TooltipProvider>
    </QueryClientProvider>
  )
}
