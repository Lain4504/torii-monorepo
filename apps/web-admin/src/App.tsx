import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { Toaster } from '@workspace/ui/components/sonner'
import { AuthGuard } from './lib/guard/auth-guard.tsx'
import { ThemeProvider } from "@/lib/providers/theme-provider.tsx"
// Component imports
import DashboardLayout from "@/components/layout/dashboard-layout.tsx";
// Feature imports
import DashboardPage from '@/routes/dashboard/dashboard-page.tsx'
import AnalyticsPage from '@/routes/dashboard/analytics-page.tsx'
import { UsersPage } from '@/routes/users/users-page.tsx'
import CoursesPage from '@/routes/courses/courses-page.tsx'
import CourseDetailPage from '@/routes/courses/course-detail-page.tsx'

import RoomsPage from '@/routes/rooms/rooms-page.tsx'
import OrdersPage from '@/routes/finance/orders-page.tsx'
import TransactionsPage from '@/routes/finance/payments-page.tsx'
import AIServicePage from '@/routes/ai/ai-service-page.tsx'
import NotificationsPage from '@/routes/settings/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import { PostPage } from '@/routes/post/post-page.tsx'
import QuestionBankPage from '@/routes/question-bank/question-bank-page.tsx'
import QuestionsPage from '@/routes/questions/questions-page.tsx'
import QuestionPoolsPage from '@/routes/question-pools/question-pools-page.tsx'
import PoolDetailPage from '@/routes/question-pools/pool-detail-page.tsx'

import LoginPage from '@/routes/auth/login-page.tsx'
import TwoFactorVerifyPage from '@/routes/auth/two-factor-verify-page.tsx'
import { AuditLogsPage } from "@/routes/audit/audit-logs-page.tsx";
import { PermissionsPage } from "@/routes/permissions/permissions-page.tsx";
import NotFoundPage from '@/routes/error/not-found-page.tsx'
import AccessDeniedPage from '@/routes/error/access-denied-page.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
})

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/verify-2fa" element={<TwoFactorVerifyPage />} />
              <Route element={
                <AuthGuard>
                  <DashboardLayout />
                </AuthGuard>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:id" element={<CourseDetailPage />} />

                <Route path="rooms" element={<RoomsPage />} />
                <Route path="posts" element={<PostPage />} />

                {/* Question Bank - Unified entry point */}
                <Route path="question-bank" element={<QuestionBankPage />}>
                  <Route index element={<QuestionsPage />} />
                  <Route path="questions" element={<QuestionsPage />} />
                  <Route path="pools" element={<QuestionPoolsPage />} />
                </Route>

                {/* Pool detail page */}
                <Route path="question-bank/pools/:id/questions" element={<PoolDetailPage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="ai-service" element={<AIServicePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="authorization/audit-logs" element={<AuditLogsPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="access-denied" element={<AccessDeniedPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default App
