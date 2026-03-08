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
// import AcademyDashboardPage from '@/routes/academy/academy-dashboard-page.tsx'
import AcademyCourseProfileCreatePage from '@/routes/academy/course-profile-create-page.tsx'
import AcademyCourseProfileEditPage from '@/routes/academy/course-profile-edit-page.tsx'
import AcademyCourseEditionCreatePage from '@/routes/academy/course-edition-create-page.tsx'
import AcademyCourseEditionEditPage from '@/routes/academy/course-edition-edit-page.tsx'
import AcademyCourseOfferingsPage from '@/routes/academy/course-offerings-page.tsx'
import AcademyCourseOfferingCreatePage from '@/routes/academy/course-offering-create-page.tsx'
import AcademyCourseOfferingEditPage from '@/routes/academy/course-offering-edit-page.tsx'
import AcademyChapterCreatePage from '@/routes/academy/chapter-create-page.tsx'
import AcademyChapterEditPage from '@/routes/academy/chapter-edit-page.tsx'
import AcademyChapterItemCreatePage from '@/routes/academy/chapter-item-create-page.tsx'
import AcademyChapterItemEditPage from '@/routes/academy/chapter-item-edit-page.tsx'
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
import AcademyCourseOfferingDetailPage from "@/routes/academy/course-offering-detail-page.tsx"
import AcademyLecturerDashboardPage from "@/routes/academy/lecturer-dashboard-page.tsx"
import AcademyQuizTemplatesPage from '@/routes/academy/quiz-templates-page.tsx'
import AcademyQuizTemplateCreatePage from '@/routes/academy/quiz-template-create-page.tsx'
import AcademyQuizTemplateEditPage from '@/routes/academy/quiz-template-edit-page.tsx'
import AcademyAssignmentTemplatesPage from '@/routes/academy/assignment-templates-page.tsx'
import AcademyAssignmentTemplateCreatePage from '@/routes/academy/assignment-template-create-page.tsx'
import AcademyAssignmentTemplateEditPage from '@/routes/academy/assignment-template-edit-page.tsx'
import AcademyQuestionsPage from '@/routes/academy/questions-page.tsx'
import AcademyExamsPage from '@/routes/academy/exams-page.tsx'
import AcademyReportsPage from '@/routes/academy/reports-page.tsx'
import AcademyCourseProfileDetailPage from '@/routes/academy/course-profile-detail-page.tsx'
import AcademyCourseEditionDetailPage from '@/routes/academy/course-edition-detail-page.tsx'
import AcademyLessonCreatePage from '@/routes/academy/lesson-create-page.tsx'
import AcademyLessonEditPage from '@/routes/academy/lesson-edit-page.tsx'
import AcademyClassReviewsPage from '@/routes/academy/class-reviews-page.tsx'
import AcademyLessonsPage from '@/routes/academy/lessons-page.tsx'
import AcademyClassAssessmentsPage from '@/routes/academy/class-assessments-page.tsx'
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

import EditorTestPage from '@/routes/test/editor-test-page.tsx'

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/test-editor" element={<EditorTestPage />} />
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
                  <Route element={<RoutePermissionGuard anyPermission={["academy.content.read", "academy.content.write", "academy.commerce.read", "academy.commerce.write", "academy.delivery.read", "academy.delivery.write", "exam.manage"]} />}>
                    {/* <Route path="academy" element={<AcademyDashboardPage />} /> */}
                    <Route path="academy/lecturer" element={<AcademyLecturerDashboardPage />} />

                    {/* 1. CONTENT LAYER: Profiles, Lessons, Quizzes, Assignments, Question Bank */}
                    <Route path="academy/course-profiles" element={<AcademyCourseProfilesPage />} />
                    <Route path="academy/course-profiles/new" element={<AcademyCourseProfileCreatePage />} />
                    <Route path="academy/course-profiles/:id" element={<AcademyCourseProfileDetailPage />} />
                    <Route path="academy/course-profiles/:id/edit" element={<AcademyCourseProfileEditPage />} />

                    <Route path="academy/lessons" element={<AcademyLessonsPage />} />
                    <Route path="academy/lessons/new" element={<AcademyLessonCreatePage />} />
                    <Route path="academy/lessons/:id/edit" element={<AcademyLessonEditPage />} />

                    <Route path="academy/quiz-templates" element={<AcademyQuizTemplatesPage />} />
                    <Route path="academy/quiz-templates/new" element={<AcademyQuizTemplateCreatePage />} />
                    <Route path="academy/quiz-templates/:id/edit" element={<AcademyQuizTemplateEditPage />} />

                    <Route path="academy/assignment-templates" element={<AcademyAssignmentTemplatesPage />} />
                    <Route path="academy/assignment-templates/new" element={<AcademyAssignmentTemplateCreatePage />} />
                    <Route path="academy/assignment-templates/:id/edit" element={<AcademyAssignmentTemplateEditPage />} />

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

                    {/* 2. DELIVERY LAYER: Editions & Syllabus */}
                    <Route path="academy/course-editions/new" element={<AcademyCourseEditionCreatePage />} />
                    <Route path="academy/course-editions/:id" element={<AcademyCourseEditionDetailPage />} />
                    <Route path="academy/course-editions/:id/edit" element={<AcademyCourseEditionEditPage />} />
                    <Route path="academy/chapters/new" element={<AcademyChapterCreatePage />} />
                    <Route path="academy/chapters/:id/edit" element={<AcademyChapterEditPage />} />
                    <Route path="academy/chapter-items/new" element={<AcademyChapterItemCreatePage />} />
                    <Route path="academy/chapter-items/:id/edit" element={<AcademyChapterItemEditPage />} />

                    {/* 3. COMMERCE LAYER: Offerings & Sales */}
                    <Route path="academy/course-offerings" element={<AcademyCourseOfferingsPage />} />
                    <Route path="academy/course-offerings/new" element={<AcademyCourseOfferingCreatePage />} />
                    <Route path="academy/course-offerings/:id" element={<AcademyCourseOfferingDetailPage />} />
                    <Route path="academy/course-offerings/:id/edit" element={<AcademyCourseOfferingEditPage />} />

                    {/* 4. OPERATION LAYER: Classes, Enrollments, Attendance, Grading */}
                    <Route path="academy/classes" element={<AcademyClassesPage />} />
                    <Route path="academy/classes/new" element={<AcademyClassCreatePage />} />
                    <Route path="academy/classes/:id" element={<AcademyClassDetailPage />} />
                    <Route path="academy/classes/:id/edit" element={<AcademyClassEditPage />} />

                    <Route path="academy/live-schedule/new" element={<AcademyLiveScheduleCreatePage />} />
                    <Route path="academy/live-schedule/:id/edit" element={<AcademyLiveScheduleEditPage />} />
                    <Route path="academy/class-assessments" element={<AcademyClassAssessmentsPage />} />
                    <Route path="academy/class-assessments/new" element={<AcademyClassAssessmentCreatePage />} />
                    <Route path="academy/class-assessments/:id/edit" element={<AcademyClassAssessmentEditPage />} />

                    <Route path="academy/enrollments" element={<AcademyEnrollmentsPage />} />
                    <Route path="academy/enrollments/new" element={<AcademyEnrollmentCreatePage />} />
                    <Route path="academy/enrollments/:id/edit" element={<AcademyEnrollmentEditPage />} />

                    <Route path="academy/exam-attempts/:id" element={<AcademyExamAttemptDetailPage />} />
                    <Route path="academy/assignment-submissions/:id" element={<AcademyAssignmentSubmissionDetailPage />} />

                    <Route path="academy/reports" element={<AcademyReportsPage />} />
                    <Route path="academy/class-reviews" element={<AcademyClassReviewsPage />} />
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
