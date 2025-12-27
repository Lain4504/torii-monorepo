import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Component imports
import DashboardLayout from "./components/layout/dashboard-layout.tsx";

// Feature imports
import DashboardPage from './features/dashboard/routes/DashboardPage'
import AnalyticsPage from './features/dashboard/routes/AnalyticsPage'

import { UsersPage } from './features/users/routes/UsersPage'
import { AddUserPage } from './features/users/routes/AddUserPage'

import CoursesPage from './features/courses/routes/CoursesPage'
import AssessmentsPage from './features/courses/routes/AssessmentsPage'

import { QuestionBankPage } from './features/question-bank/routes/QuestionBankPage'

import RoomsPage from './features/rooms/routes/RoomsPage'

import PaymentsPage from './features/finance/routes/PaymentsPage'

import AIServicePage from './features/ai/routes/AIServicePage'

import NotificationsPage from './features/settings/routes/NotificationsPage'
import PermissionsPage from './features/settings/routes/PermissionsPage'
import SettingsPage from './features/settings/routes/SettingsPage'

import LoginPage from './features/auth/routes/LoginPage'

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
