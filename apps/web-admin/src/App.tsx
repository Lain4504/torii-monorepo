import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from './store/store'
import DashboardPage from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage.tsx'
import { AddUserPage } from './pages/AddUserPage.tsx'
import CoursesPage from './pages/CoursesPage'
import AssessmentsPage from './pages/AssessmentsPage'
import { QuestionBankPage } from './pages/question-bank/QuestionBankPage'
import RoomsPage from './pages/RoomsPage'
import PaymentsPage from './pages/PaymentsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AIServicePage from './pages/AIServicePage'
import NotificationsPage from './pages/NotificationsPage'
import PermissionsPage from './pages/PermissionsPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from "./components/layout/dashboard-layout.tsx"
import { ProtectedRoute } from './components/auth/protected-route'
import { PublicRoute } from './components/auth/public-route'

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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            
            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="users/new" element={<AddUserPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="assessments" element={<AssessmentsPage />} />
              <Route path="question-bank" element={<QuestionBankPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ai-service" element={<AIServicePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
