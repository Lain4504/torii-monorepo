import React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb"
import { ChevronRight } from "lucide-react"

import { ModeToggle } from "@/components/layout/mode-toggle.tsx"
import { CommandMenu } from "@/components/layout/command-menu.tsx"
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown.tsx"
import { useSelector } from "react-redux"
import { selectUser } from "@/store/slices/auth-slice"
import { UserRole } from "@workspace/schemas"

export function DashboardHeader() {
  const location = useLocation()
  const user = useSelector(selectUser)
  const isLecturer = user?.role === UserRole.LECTURER

  const pathSegments = location.pathname.split('/').filter(Boolean)

  return (
    <div className="flex w-full items-center justify-between gap-4 h-14">
      {/* Breadcrumbs - Refined Admin Style */}
      <div className="hidden md:flex items-center text-sm px-1 overflow-hidden">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="text-xs font-semibold text-muted-foreground/60 hover:text-primary transition-colors flex items-center gap-2">
                  Bảng điều khiển
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && (
              <BreadcrumbSeparator className="opacity-30">
                <ChevronRight className="size-3" />
              </BreadcrumbSeparator>
            )}
            {pathSegments.map((segment, index) => {
              const isLast = index === pathSegments.length - 1
              // Map segments to valid paths
              let href = `/${pathSegments.slice(0, index + 1).join('/')}`

              // Handle special cases where parent route doesn't exist
              if (segment === 'academy') href = '/'

              // Lecturer exceptions
              if (isLecturer && segment === 'course-master') href = '/course-master/my'

              // Friendly names map
              const labels: Record<string, string> = {
                'academy': 'Học thuật',
                'course-profiles': 'Kho Khóa học',
                'cohorts': 'Đợt khai giảng',
                'vod-packages': 'Khóa học VOD',
                'live-classes': 'Lớp học LIVE',
                'lessons': 'Bài dạy',
                'quizzes': 'Trắc nghiệm',
                'assignments': 'Bài tập',
                'exams': 'Kỳ thi',
                'question-pools': 'Ngân hàng câu hỏi',
                'users': 'Người dùng',
                'roles': 'Vai trò',
                'orders': 'Đơn hàng',
                'coupons': 'Mã giảm giá',
                'tickets': 'Hỗ trợ',
              }

              const label = labels[segment] || segment.replace(/-/g, ' ')

              if (segment.length > 20 && !labels[segment]) return null;

              return (
                <React.Fragment key={href + index}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="capitalize text-xs font-bold italic text-foreground flex items-center gap-2 max-w-[200px] truncate">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link
                          to={href}
                          className="capitalize text-xs font-semibold text-muted-foreground/50 hover:text-foreground transition-colors"
                        >
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && (
                    <BreadcrumbSeparator className="opacity-30">
                      <ChevronRight className="size-3" />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
        <div className="flex items-center gap-1 sm:gap-1.5">
          <CommandMenu />
          <NotificationsDropdown />
          <div className="hidden sm:block w-px h-4 bg-border/50 mx-0.5" />
          <ModeToggle />
        </div>
      </div>
    </div>
  )
}
