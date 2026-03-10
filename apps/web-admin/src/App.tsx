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

import UsersManagementPage from '@/routes/users/users-management-page.tsx'
import CouponsPage from '@/routes/coupons/coupons-page.tsx'

import OrdersPage from '@/routes/finance/orders-page.tsx'

import NotificationsPage from '@/routes/notification/notifications-page.tsx'
import SettingsPage from '@/routes/settings/settings-page.tsx'
import ProfilePage from '@/routes/profile/profile-page.tsx'
import { BlogPage } from '@/routes/blog/blog-page.tsx'
import EditBlogPage from '@/routes/blog/edit-blog-page.tsx'
import CreateBlogPage from '@/routes/blog/create-blog-page.tsx'

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
import AcademyCourseOfferingsPage from '@/routes/academy/course-offerings-page.tsx'
import AcademyCourseOfferingCreatePage from '@/routes/academy/course-offering-create-page.tsx'
import AcademyCourseOfferingEditPage from '@/routes/academy/course-offering-edit-page.tsx'
import AcademyClassesPage from '@/routes/academy/classes-page.tsx'
import AcademyClassCreatePage from '@/routes/academy/class-create-page.tsx'
import AcademyClassEditPage from '@/routes/academy/class-edit-page.tsx'
import AcademyLiveScheduleCreatePage from '@/routes/academy/live-schedule-create-page.tsx'
import AcademyLiveScheduleEditPage from '@/routes/academy/live-schedule-edit-page.tsx'
import AcademyClassAssessmentCreatePage from '@/routes/academy/class-assessment-create-page.tsx'
import AcademyClassAssessmentEditPage from '@/routes/academy/class-assessment-edit-page.tsx'
import AcademyQuestionCreatePage from '@/routes/academy/question-create-page.tsx'
import AcademyQuestionEditPage from '@/routes/academy/question-edit-page.tsx'

import AcademyQuestionPoolNewPage from '@/routes/academy/question-pool-new-page.tsx'
import AcademyQuestionPoolEditPage from '@/routes/academy/question-pool-edit-page.tsx'
import AcademyQuestionPoolDetailPage from '@/routes/academy/question-pool-detail-page.tsx'
import AcademyExamCreatePage from '@/routes/academy/exam-create-page.tsx'
import AcademyExamEditPage from '@/routes/academy/exam-edit-page.tsx'
import AcademyExamDetailPage from '@/routes/academy/exam-detail-page.tsx'
import AcademyExamAttemptDetailPage from '@/routes/academy/exam-attempt-detail-page.tsx'
import AcademyAssignmentSubmissionDetailPage from '@/routes/academy/assignment-submission-detail-page.tsx'
import AcademyEnrollmentCreatePage from '@/routes/academy/enrollment-create-page.tsx'
import AcademyEnrollmentEditPage from '@/routes/academy/enrollment-edit-page.tsx'
import AcademyClassDetailPage from "@/routes/academy/class-detail-page.tsx"
import AcademyClassSyllabusPage from "@/routes/academy/class-syllabus-page.tsx"
import AcademyCourseOfferingDetailPage from "@/routes/academy/course-offering-detail-page.tsx"

import AcademyQuestionsPage from '@/routes/academy/questions-page.tsx'
import AcademyExamsPage from '@/routes/academy/exams-page.tsx'

import AcademyCourseProfileDetailPage from '@/routes/academy/course-profile-detail-page.tsx'
import AcademyLessonCreatePage from '@/routes/academy/lesson-create-page.tsx'
import AcademyLessonEditPage from '@/routes/academy/lesson-edit-page.tsx'
import AcademyDashboardPage from '@/routes/academy/academy-dashboard-page.tsx'
import AcademyApprovalsPage from '@/routes/academy/approvals-page.tsx'
import MyClassesPage from '@/routes/academy/my-classes-page.tsx'


import RewardsPage from '@/routes/gamification/rewards-page.tsx'
import QuestionPoolsPage from '@/routes/academy/question-pools-page.tsx'
import AcademyEnrollmentsPage from '@/routes/academy/enrollments-page.tsx'
import AchievementsPage from '@/routes/gamification/achievements-page.tsx'

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
                  <Route element={<RoutePermissionGuard anyPermission={["academy.content.read", "academy.content.write", "academy.content.approve", "academy.commerce.read", "academy.commerce.write", "academy.commerce.approve", "academy.delivery.read", "academy.delivery.write", "academy.delivery.approve", "exam.manage"]} />}>
                    <Route path="academy" element={<AcademyDashboardPage />} />
                    <Route path="academy/approvals" element={<AcademyApprovalsPage />} />
                    <Route path="my-classes" element={<MyClassesPage />} />

                    <Route path="academy/course-profiles" element={<AcademyCourseProfilesPage />} />
                    <Route path="academy/course-profiles/:id" element={<AcademyCourseProfileDetailPage />} />

                    <Route path="academy/lessons/new" element={<AcademyLessonCreatePage />} />
                    <Route path="academy/lessons/:id/edit" element={<AcademyLessonEditPage />} />

                    <Route path="academy/questions" element={<AcademyQuestionsPage />} />
                    <Route path="academy/questions/new" element={<AcademyQuestionCreatePage />} />
                    <Route path="academy/questions/:id/edit" element={<AcademyQuestionEditPage />} />

                    <Route path="academy/question-pools" element={<QuestionPoolsPage />} />
                    <Route path="academy/question-pools/new" element={<AcademyQuestionPoolNewPage />} />
                    <Route path="academy/question-pools/:id" element={<AcademyQuestionPoolDetailPage />} />
                    <Route path="academy/question-pools/:id/edit" element={<AcademyQuestionPoolEditPage />} />
                    <Route path="academy/exams" element={<AcademyExamsPage />} />
                    <Route path="academy/exams/new" element={<AcademyExamCreatePage />} />
                    <Route path="academy/exams/:id" element={<AcademyExamDetailPage />} />
                    <Route path="academy/exams/:id/edit" element={<AcademyExamEditPage />} />

                    {/* 3. COMMERCE LAYER: Offerings & Sales */}
                    <Route path="academy/course-offerings" element={<AcademyCourseOfferingsPage />} />
                    <Route path="academy/course-offerings/new" element={<AcademyCourseOfferingCreatePage />} />
                    <Route path="academy/course-offerings/:id" element={<AcademyCourseOfferingDetailPage />} />
                    <Route path="academy/course-offerings/:id/edit" element={<AcademyCourseOfferingEditPage />} />

                    {/* 4. OPERATION LAYER: Classes, Enrollments, Attendance, Grading */}
                    <Route path="academy/classes" element={<AcademyClassesPage />} />
                    {/* Canonical route: create class under specific Course Profile */}
                    <Route path="academy/:courseProfileId/classes/new" element={<AcademyClassCreatePage />} />
                    <Route path="academy/classes/:id" element={<AcademyClassDetailPage />} />
                    <Route path="academy/classes/:id/edit" element={<AcademyClassEditPage />} />
                    <Route path="academy/classes/:id/syllabus" element={<AcademyClassSyllabusPage />} />

                    <Route path="academy/live-schedule/new" element={<AcademyLiveScheduleCreatePage />} />
                    <Route path="academy/live-schedule/:id/edit" element={<AcademyLiveScheduleEditPage />} />

                    <Route path="academy/class-assessments/new" element={<AcademyClassAssessmentCreatePage />} />
                    <Route path="academy/class-assessments/:id/edit" element={<AcademyClassAssessmentEditPage />} />

                    <Route path="academy/enrollments" element={<AcademyEnrollmentsPage />} />
                    <Route path="academy/enrollments/new" element={<AcademyEnrollmentCreatePage />} />
                    <Route path="academy/enrollments/:id/edit" element={<AcademyEnrollmentEditPage />} />

                    <Route path="academy/exam-attempts/:id" element={<AcademyExamAttemptDetailPage />} />
                    <Route path="academy/assignment-submissions/:id" element={<AcademyAssignmentSubmissionDetailPage />} />


                  </Route>

                  <Route element={<RoutePermissionGuard permission="coupon.manage" />}>
                    <Route path="coupons" element={<CouponsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="gamification.manage" />}>
                    <Route path="rewards" element={<RewardsPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard anyPermission={["payment.view", "payment.refund", "payment.manage"]} />}>
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>

                  <Route element={<RoutePermissionGuard permission="gamification.manage" />}>
                    <Route path="rewards" element={<RewardsPage />} />
                    <Route path="achievements" element={<AchievementsPage />} />
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
    </ReduxProvider>
  )
}

export default App
