import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'

function NavigateToClassTab({ tab }: { tab: string }) {
  const { classId } = useParams<{ classId: string }>()
  return <Navigate to={`/academy/live-classes/${classId}/detail?tab=${tab}`} replace />
}
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

import UsersManagementPage from '@/routes/users/users-management-page.tsx'
import CouponsPage from '@/routes/coupons/coupons-page.tsx'

import OrdersPage from '@/routes/finance/orders-page.tsx'

import NotificationsPage from '@/routes/notification/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import ProfilePage from '@/routes/profile/profile-page.tsx'
import { BlogPage } from '@/routes/blog/blog-page.tsx'
import CreateBlogPage from '@/routes/blog/create-blog-page.tsx'
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
import CourseProfilesPage from '@/routes/academy/course-profiles/course-profiles-page.tsx'
import CourseProfileDetailPage from '@/routes/academy/course-profiles/course-profile-detail-page.tsx'
import CourseEditionsPage from '@/routes/academy/course-editions/course-editions-page'
import LiveClassesPage from '@/routes/academy/live-classes/live-classes-page'
import LiveClassStudentsPage from '@/routes/academy/live-classes/live-class-students-page'
import CohortsPage from '@/routes/academy/cohorts/cohorts-page'
import CohortDetailPage from '@/routes/academy/cohorts/cohort-detail-page'
import VodPackagesPage from '@/routes/academy/vod-packages/vod-packages-page'
import VodPackageDetailPage from '@/routes/academy/vod-packages/vod-package-detail-page'
import AssignmentGradingPage from '@/routes/academy/live-classes/assignment-grading-page'
import ApprovalsPage from '@/routes/academy/approvals/approvals-page'
import CohortApprovalPreviewPage from '@/routes/academy/approvals/cohort-preview-page'
import VodPackageApprovalPreviewPage from '@/routes/academy/approvals/vod-package-preview-page'
import CourseProfileApprovalPreviewPage from '@/routes/academy/approvals/course-profile-preview-page'
import RewardsPage from '@/routes/gamification/rewards-page.tsx'
import AchievementsPage from '@/routes/gamification/achievements-page.tsx'
import AiSubscriptionsPage from '@/routes/academy/ai-subscriptions/ai-subscriptions-page.tsx'

import JlptTemplatesPage from '@/routes/academy/jlpt/templates/page.tsx'
import JlptQuestionsPage from '@/routes/academy/jlpt/questions/page.tsx'
import JlptQuestionDetailPage from '@/routes/academy/jlpt/questions/[id]/page.tsx'
import JlptTemplateDetailPage from '@/routes/academy/jlpt/templates/[id]/page.tsx'
import JlptMondaiMasterPage from '@/routes/academy/jlpt/mondai/page.tsx'
import JlptConfigPage from '@/routes/academy/jlpt/config/page.tsx'

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


                  <Route element={<RoutePermissionGuard anyPermission={["user.manage", "user.view"]} />}>
                    <Route path="users" element={<UsersManagementPage />} />
                  </Route>
                  <Route element={<RoutePermissionGuard permission="user.manage" />}>
                    <Route path="permissions" element={<PermissionsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard anyPermission={["blog.manage", "blog.write"]} />}>
                    <Route path="blogs" element={<BlogPage />} />
                    <Route path="blogs/create" element={<CreateBlogPage />} />
                    <Route path="blogs/:id/edit" element={<EditBlogPage />} />
                  </Route>

                  {/* Academy - Core Grouping */}
                  <Route element={<RoutePermissionGuard anyPermission={["academy.content.read", "academy.content.write", "academy.delivery.read", "academy.delivery.write"]} />}>
                    <Route path="academy/course-profiles" element={<CourseProfilesPage />} />
                    <Route path="academy/course-profiles/:profileId/detail" element={<CourseProfileDetailPage />} />
                    <Route path="academy/course-editions" element={<CourseEditionsPage />} />
                    <Route path="academy/live-classes" element={<LiveClassesPage />} />
                    <Route path="academy/live-classes/:classId/detail" element={<LiveClassStudentsPage />} />
                    <Route path="academy/live-classes/:classId/schedule" element={<NavigateToClassTab tab="schedule" />} />
                    <Route path="academy/live-classes/:classId/assessments" element={<NavigateToClassTab tab="assignments" />} />
                    <Route path="academy/cohorts" element={<CohortsPage />} />
                    <Route path="academy/cohorts/:cohortId/detail" element={<CohortDetailPage />} />
                    <Route path="academy/vod-packages" element={<VodPackagesPage />} />
                    <Route path="academy/vod-packages/:id/detail" element={<VodPackageDetailPage />} />
                    <Route path="academy/live-classes/:classId/assignments/:assessmentId/submissions" element={<AssignmentGradingPage />} />

                    {/* AI Subscriptions */}
                    <Route path="academy/ai-subscriptions" element={<AiSubscriptionsPage />} />

                    {/* JLPT Mock Exams */}
                    <Route path="academy/jlpt/config" element={<JlptConfigPage />} />
                    <Route path="academy/jlpt/templates" element={<JlptTemplatesPage />} />
                    <Route path="academy/jlpt/templates/:id" element={<JlptTemplateDetailPage />} />
                    <Route path="academy/jlpt/questions" element={<JlptQuestionsPage />} />
                    <Route path="academy/jlpt/questions/:id" element={<JlptQuestionDetailPage />} />
                    <Route path="academy/jlpt/mondai" element={<JlptMondaiMasterPage />} />
                  </Route>
                  <Route element={<RoutePermissionGuard anyPermission={["academy.content.approve", "academy.commerce.approve", "academy.delivery.approve", "academy.content.write", "academy.commerce.write", "academy.delivery.write"]} />}>
                    <Route path="academy/approvals" element={<ApprovalsPage />} />
                    <Route path="academy/approvals/cohorts/:id" element={<CohortApprovalPreviewPage />} />
                    <Route path="academy/approvals/vod-packages/:id" element={<VodPackageApprovalPreviewPage />} />
                    <Route
                      path="academy/approvals/course-profiles/:id"
                      element={<CourseProfileApprovalPreviewPage />}
                    />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="coupon.manage" />}>
                    <Route path="coupons" element={<CouponsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="gamification.manage" />}>
                    <Route path="rewards" element={<RewardsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard anyPermission={["payment.view", "payment.manage"]} />}>
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="gamification.manage" />}>
                    <Route path="rewards" element={<RewardsPage />} />
                    <Route path="achievements" element={<AchievementsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="audit.view" />}>
                    <Route path="audit-logs" element={<AuditLogsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="system.config" />}>
                    <Route path="notifications" element={<NotificationsPage />} />
                  </Route>

                  <Route path="settings" element={<SettingsPage />} />

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
    </ReduxProvider>
  )
}

export default App
