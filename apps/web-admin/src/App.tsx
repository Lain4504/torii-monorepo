import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DashboardPage from './pages/DashboardPage'
import { UsersPage } from './pages/UsersPage.tsx'
import { AddUserPage } from './pages/AddUserPage.tsx'
import CoursesPage from './pages/CoursesPage'
import ModulesPage from './pages/ModulesPage'
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
import DashboardLayout from "./components/layout/dashboard-layout.tsx";

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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="users/new" element={<AddUserPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="modules" element={<ModulesPage />} />
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
  )
}

export default App
