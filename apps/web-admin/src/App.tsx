import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { Toaster } from '@workspace/ui/components/sonner'
import { AuthGuard } from './components/auth/auth-guard.tsx'
// Component imports
import DashboardLayout from "./components/layout/dashboard-layout.tsx";
// Feature imports
import DashboardPage from './features/dashboard/routes/dashboard-page'
import AnalyticsPage from './features/dashboard/routes/analytics-page'
import { UsersPage } from './features/users/routes/users-page'
import CoursesPage from './features/courses/routes/courses-page'
import ModulesPage from './features/modules/routes/modules-page'
import LessonsPage from './features/lessons/routes/lessons-page'
import { QuestionBankPage } from './features/question-bank/routes/question-bank-page'
import RoomsPage from './features/rooms/routes/rooms-page'
import PaymentsPage from './features/finance/routes/payments-page'
import AIServicePage from './features/ai/routes/ai-service-page'
import NotificationsPage from './features/settings/routes/notifications-page'
import PermissionsPage from './features/settings/routes/permissions-page'
import SettingsPage from './features/settings/routes/settings-page'
import { PermissionsPage as RBACPermissionsPage } from './features/permissions'
import { AuditLogsPage } from './features/audit'
import { BlogPage } from './features/blog/routes/blog-page'

import LoginPage from './features/auth/routes/login-page'

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
              <Route path="rbac/permissions" element={<RBACPermissionsPage />} />
              <Route path="rbac/audit-logs" element={<AuditLogsPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </ReduxProvider>
  )
}

export default App
