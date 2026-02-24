import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider as ReduxProvider } from 'react-redux'
import { store } from './store'
import { Toaster } from '@workspace/ui/components/sonner'
import { AuthGuard } from './lib/guard/auth-guard.tsx'
import { RoutePermissionGuard } from './lib/guard/route-permission-guard.tsx'
import { ThemeProvider } from "@/lib/providers/theme-provider.tsx"
import { TooltipProvider } from '@workspace/ui/components/tooltip';
// Component imports
import DashboardLayout from "@/components/layout/dashboard-layout.tsx";
// Feature imports
import DashboardPage from '@/routes/dashboard/dashboard-page.tsx'
import RevenueAnalytics from '@/routes/analytics/revenue-analytics.tsx'
import LearningAnalytics from '@/routes/analytics/learning-analytics.tsx'
import UserAnalytics from '@/routes/analytics/user-analytics.tsx'

import LearnersPage from '@/routes/users/learners-page.tsx'
import PersonnelPage from '@/routes/users/personnel-page.tsx'
import CouponsPage from '@/routes/coupons/coupons-page.tsx'
import CoursesPage from '@/routes/courses/courses-page.tsx'
import CourseReviewsPage from '@/routes/courses/course-reviews-page.tsx'
import CourseDetailPage from '@/routes/courses/course-detail-page.tsx'
import MyCoursesPage from '@/routes/courses/my-courses-page.tsx'
import ScheduleRequestsPage from '@/routes/courses/schedule-requests-page.tsx'
import CourseLiveSessionsPage from '@/routes/courses/course-live-sessions-page.tsx'


import RoomsPage from '@/routes/rooms/rooms-page.tsx'
import OrdersPage from '@/routes/finance/orders-page.tsx'

import NotificationsPage from '@/routes/notification/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import { BlogPage } from '@/routes/blog/blog-page.tsx'
import QuestionPoolsPage from '@/routes/question-pools/question-pools-page.tsx'
import PoolDetailPage from '@/routes/question-pools/pool-detail-page.tsx'

import LoginPage from '@/routes/auth/login-page.tsx'
import ForgotPasswordPage from '@/routes/auth/forgot-password-page.tsx'
import ResetPasswordPage from '@/routes/auth/reset-password-page.tsx'

import TwoFactorVerifyPage from '@/routes/auth/two-factor-verify-page.tsx'
import { AuditLogsPage } from "@/routes/audit/audit-logs-page.tsx";
import { PermissionsPage } from "@/routes/permissions/permissions-page.tsx";
import TicketsPage from '@/routes/tickets/tickets-page.tsx'
import RewardsPage from '@/routes/gamification/rewards-page.tsx'
import NotFoundPage from '@/routes/error/not-found-page.tsx'
import AccessDeniedPage from '@/routes/error/access-denied-page.tsx'
import ServiceUnavailablePage from '@/routes/error/service-unavailable-page.tsx'
import NotImplementedPage from '@/routes/error/not-implemented-page.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1, // Reduced for easier debugging
      refetchOnWindowFocus: false, // Avoid unexpected reloads during dev
    },
  },
})

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route path="/auth/verify-2fa" element={<TwoFactorVerifyPage />} />
                <Route element={
                  <AuthGuard>
                    <DashboardLayout />
                  </AuthGuard>
                }>
                  <Route index element={<DashboardPage />} />

                  <Route path="courses" element={<CoursesPage />} />
                  <Route path="courses/my" element={<MyCoursesPage />} />
                  <Route path="courses/reviews" element={<CourseReviewsPage />} />
                  <Route path="courses/requests" element={<ScheduleRequestsPage />} />
                  <Route path="courses/:id" element={<CourseDetailPage />} />
                  <Route path="courses/:id/live-sessions" element={<CourseLiveSessionsPage />} />

                  <Route path="rooms" element={<RoomsPage />} />

                  <Route element={<RoutePermissionGuard anyPermission={["user.manage", "user.view"]} />}>
                    <Route path="learners" element={<LearnersPage />} />
                    <Route path="personnel/lecturers" element={<PersonnelPage />} />
                    <Route path="personnel/staff" element={<PersonnelPage />} />
                  </Route>
                  <Route element={<RoutePermissionGuard permission="user.manage" />}>
                    <Route path="permissions" element={<PermissionsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard anyPermission={["blog.manage", "blog.write"]} />}>
                    <Route path="blogs" element={<BlogPage />} />
                  </Route>

                  {/* Question Bank */}
                  <Route path="question-bank" element={<QuestionPoolsPage />} />
                  <Route path="question-bank/:id" element={<PoolDetailPage />} />

                  <Route element={<RoutePermissionGuard permission="coupon.manage" />}>
                    <Route path="coupons" element={<CouponsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard anyPermission={["payment.view", "payment.refund", "payment.manage"]} />}>
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="report.view" />}>
                    <Route path="analytics/revenue" element={<RevenueAnalytics />} />
                    <Route path="analytics/learning" element={<LearningAnalytics />} />
                    <Route path="analytics/users" element={<UserAnalytics />} />

                  </Route>


                  <Route element={<RoutePermissionGuard permission="audit.view" />}>
                    <Route path="audit-logs" element={<AuditLogsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="system.config" />}>
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="support.handle" />}>
                    <Route path="tickets" element={<TicketsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="gamification.manage" />}>
                    <Route path="rewards" element={<RewardsPage />} />
                  </Route>

                  <Route path="access-denied" element={<AccessDeniedPage />} />
                  <Route path="503" element={<ServiceUnavailablePage />} />
                  <Route path="501" element={<NotImplementedPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster position="top-center" />
          </TooltipProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ThemeProvider>
    </ReduxProvider >
  )
}

export default App
