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

import RoomsPage from '@/routes/rooms/rooms-page.tsx'
import OrdersPage from '@/routes/finance/orders-page.tsx'

import NotificationsPage from '@/routes/notification/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import ProfilePage from '@/routes/profile/profile-page.tsx'
import { BlogPage } from '@/routes/blog/blog-page.tsx'
import EditBlogPage from '@/routes/blog/edit-blog-page.tsx'

import LoginPage from '@/routes/auth/login-page.tsx'
import ForgotPasswordPage from '@/routes/auth/forgot-password-page.tsx'
import ResetPasswordPage from '@/routes/auth/reset-password-page.tsx'

import TwoFactorVerifyPage from '@/routes/auth/two-factor-verify-page.tsx'
import { AuditLogsPage } from "@/routes/audit/audit-logs-page.tsx";
import { PermissionsPage } from "@/routes/permissions/permissions-page.tsx";
import TicketsPage from '@/routes/tickets/tickets-page.tsx'
import NotFoundPage from '@/routes/error/not-found-page.tsx'
import AccessDeniedPage from '@/routes/error/access-denied-page.tsx'
import ServiceUnavailablePage from '@/routes/error/service-unavailable-page.tsx'
import NotImplementedPage from '@/routes/error/not-implemented-page.tsx'
import UnauthorizedPage from '@/routes/error/unauthorized-page.tsx'
import AcademyCourseProfilesPage from '@/routes/academy/course-profiles-page.tsx'
import AcademyDashboardPage from '@/routes/academy/academy-dashboard-page.tsx'
import AcademyCourseProfileCreatePage from '@/routes/academy/course-profile-create-page.tsx'
import AcademyCourseProfileEditPage from '@/routes/academy/course-profile-edit-page.tsx'
import AcademyCourseEditionsPage from '@/routes/academy/course-editions-page.tsx'
import AcademyCourseEditionCreatePage from '@/routes/academy/course-edition-create-page.tsx'
import AcademyCourseEditionEditPage from '@/routes/academy/course-edition-edit-page.tsx'
import AcademyCourseOfferingsPage from '@/routes/academy/course-offerings-page.tsx'
import AcademyCourseOfferingCreatePage from '@/routes/academy/course-offering-create-page.tsx'
import AcademyCourseOfferingEditPage from '@/routes/academy/course-offering-edit-page.tsx'
import AcademyChaptersPage from '@/routes/academy/chapters-page.tsx'
import AcademyChapterCreatePage from '@/routes/academy/chapter-create-page.tsx'
import AcademyChapterEditPage from '@/routes/academy/chapter-edit-page.tsx'
import AcademyChapterItemsPage from '@/routes/academy/chapter-items-page.tsx'
import AcademyChapterItemCreatePage from '@/routes/academy/chapter-item-create-page.tsx'
import AcademyChapterItemEditPage from '@/routes/academy/chapter-item-edit-page.tsx'

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
                    <Route path="blogs/:id/edit" element={<EditBlogPage />} />
                  </Route>

                  {/* Question Bank (legacy) removed; will be replaced by Academy exams/questions */}

                  {/* Academy (new core LMS) */}
                  <Route element={<RoutePermissionGuard anyPermission={["academy.content.read", "academy.content.write", "academy.commerce.read", "academy.commerce.write"]} />}>
                    <Route path="academy" element={<AcademyDashboardPage />} />
                    <Route path="academy/course-profiles" element={<AcademyCourseProfilesPage />} />
                    <Route path="academy/course-profiles/new" element={<AcademyCourseProfileCreatePage />} />
                    <Route path="academy/course-profiles/:id/edit" element={<AcademyCourseProfileEditPage />} />
                    <Route path="academy/course-editions" element={<AcademyCourseEditionsPage />} />
                    <Route path="academy/course-editions/new" element={<AcademyCourseEditionCreatePage />} />
                    <Route path="academy/course-editions/:id/edit" element={<AcademyCourseEditionEditPage />} />
                    <Route path="academy/course-offerings" element={<AcademyCourseOfferingsPage />} />
                    <Route path="academy/course-offerings/new" element={<AcademyCourseOfferingCreatePage />} />
                    <Route path="academy/course-offerings/:id/edit" element={<AcademyCourseOfferingEditPage />} />
                    <Route path="academy/chapters" element={<AcademyChaptersPage />} />
                    <Route path="academy/chapters/new" element={<AcademyChapterCreatePage />} />
                    <Route path="academy/chapters/:id/edit" element={<AcademyChapterEditPage />} />
                    <Route path="academy/chapter-items" element={<AcademyChapterItemsPage />} />
                    <Route path="academy/chapter-items/new" element={<AcademyChapterItemCreatePage />} />
                    <Route path="academy/chapter-items/:id/edit" element={<AcademyChapterItemEditPage />} />
                  </Route>

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

                  <Route path="profile" element={<ProfilePage />} />

                  <Route element={<RoutePermissionGuard permission="support.handle" />}>
                    <Route path="tickets" element={<TicketsPage />} />
                  </Route>

                  <Route path="access-denied" element={<AccessDeniedPage />} />
                  <Route path="unauthorized" element={<UnauthorizedPage />} />
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
