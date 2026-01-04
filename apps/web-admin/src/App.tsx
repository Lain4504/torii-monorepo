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
import ModulesPage from '@/routes/modules/modules-page.tsx'
import LessonsPage from '@/routes/lessons/lessons-page.tsx'
import { QuestionBankPage } from '@/routes/question-bank/question-bank-page.tsx'
import RoomsPage from '@/routes/rooms/rooms-page.tsx'
import PaymentsPage from '@/routes/finance/payments-page.tsx'
import AIServicePage from '@/routes/ai/ai-service-page.tsx'
import NotificationsPage from '@/routes/settings/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import { BlogPage } from '@/routes/blog/blog-page.tsx'

import LoginPage from '@/routes/auth/login-page.tsx'
import {AuditLogsPage} from "@/routes/audit/audit-logs-page.tsx";
import {PermissionsPage} from "@/routes/permissions/permissions-page.tsx";

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
              <Route element={
                <AuthGuard>
                  <DashboardLayout />
                </AuthGuard>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="modules" element={<ModulesPage />} />
                <Route path="lessons" element={<LessonsPage />} />
                <Route path="question-bank" element={<QuestionBankPage />} />
                <Route path="rooms" element={<RoomsPage />} />
                <Route path="blogs" element={<BlogPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="ai-service" element={<AIServicePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="rbac/audit-logs" element={<AuditLogsPage />} />
                <Route path="permissions" element={<PermissionsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider>
  )
}

export default App
