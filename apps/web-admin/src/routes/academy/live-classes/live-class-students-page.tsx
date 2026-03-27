import { useEffect, useMemo } from "react"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, Users, CalendarCheck, FileText, Info, MessageSquare, Folder, BookOpen } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useAcademyLiveClass } from "@/lib/api/services/academy-live-classes"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, isStaffBranchRole } from "@workspace/schemas"
import { ClassInfoTab } from "./tabs/class-info-tab"
import { ClassStudentsTab } from "./tabs/class-students-tab"
import { ClassDiscussionTab } from "./tabs/class-discussion-tab"
import { ClassAttendanceTab } from "@/components/academy/class-attendance-tab"
import { ClassAssignmentsTab } from "./tabs/class-assignments-tab"
import { ClassResourcesTab } from "./tabs/class-resources-tab"
import { ClassSyllabusTab } from "./tabs/class-syllabus-tab"

const TAB_INFO = "info"
const TAB_STUDENTS = "students"
const TAB_DISCUSSION = "discussion"
const TAB_SCHEDULE = "schedule"
const TAB_ASSIGNMENTS = "assignments"
const TAB_RESOURCES = "resources"
const TAB_SYLLABUS = "syllabus"

export default function ClassStudentsPage() {
  const { classId } = useParams<{ classId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: academyClass, isLoading: isLoadingClass } = useAcademyLiveClass(classId)
  const { user } = useAuth()

  const isStaffOrAdmin = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role)
  const isLecturer = user?.role === UserRole.LECTURER
  const canManageStatus = isStaffOrAdmin || isLecturer

  const defaultTab = TAB_INFO
  const tabParam = searchParams.get("tab") || defaultTab

  const availableTabs = useMemo(() => {
    return { info: true, syllabus: true, students: true, discussion: true, schedule: true, assignments: true, resources: true }
  }, [])

  const activeTab = useMemo(() => {
    if (!availableTabs.schedule && tabParam === TAB_SCHEDULE) return defaultTab
    if (!availableTabs.assignments && tabParam === TAB_ASSIGNMENTS) return defaultTab
    if (
      tabParam === TAB_INFO ||
      tabParam === TAB_SYLLABUS ||
      tabParam === TAB_SCHEDULE ||
      tabParam === TAB_ASSIGNMENTS ||
      tabParam === TAB_RESOURCES ||
      tabParam === TAB_STUDENTS ||
      tabParam === TAB_DISCUSSION
    ) {
      return tabParam
    }
    return defaultTab
  }, [tabParam, availableTabs])

  const canManageEnrollment = isStaffOrAdmin

  const setTab = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === defaultTab) {
        next.delete("tab")
      } else {
        next.set("tab", value)
      }
      return next
    })
  }

  useEffect(() => {
    if (isLoadingClass) return
    if (!availableTabs.schedule && tabParam === TAB_SCHEDULE) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("tab")
        return next
      })
    }
    if (!availableTabs.assignments && tabParam === TAB_ASSIGNMENTS) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete("tab")
        return next
      })
    }
  }, [tabParam, availableTabs, isLoadingClass, setSearchParams])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/live-classes"
              className="hover:underline text-muted-foreground transition-colors"
            >
              Lớp học
            </Link>
            <ChevronRight className="size-4" />
            <span>Quản lý lớp</span>
          </div>
        }
        subtitle={
          academyClass
            ? `Quản lý học viên, lịch học & điểm danh, bài tập của lớp ${academyClass.code}.`
            : "Quản lý chi tiết lớp học."
        }
        stats={
          academyClass
            ? [
              { label: "Mã lớp", value: academyClass.code },
              { label: "Loại hình", value: "LIVE" },
            ]
            : undefined
        }
      />

      {!classId ? (
        <div className="p-8 text-muted-foreground">Thiếu classId trên URL.</div>
      ) : isLoadingClass ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full overflow-x-auto whitespace-nowrap">
            <TabsTrigger value={TAB_INFO} className="gap-2">
              <Info className="size-4" />
              Thông tin chung
            </TabsTrigger>
            <TabsTrigger value={TAB_SYLLABUS} className="gap-2">
              <BookOpen className="size-4" />
              Giáo trình
            </TabsTrigger>
            <TabsTrigger value={TAB_STUDENTS} className="gap-2">
              <Users className="size-4" />
              Học viên
            </TabsTrigger>
            <TabsTrigger value={TAB_DISCUSSION} className="gap-2">
              <MessageSquare className="size-4" />
              Thảo luận
            </TabsTrigger>
            {availableTabs.schedule && (
              <TabsTrigger value={TAB_SCHEDULE} className="gap-2">
                <CalendarCheck className="size-4" />
                Lịch học & Điểm danh
              </TabsTrigger>
            )}
            {availableTabs.assignments && (
              <TabsTrigger value={TAB_ASSIGNMENTS} className="gap-2">
                <FileText className="size-4" />
                Bài tập
              </TabsTrigger>
            )}
            <TabsTrigger value={TAB_RESOURCES} className="gap-2">
              <Folder className="size-4" />
              Tài liệu chia sẻ
            </TabsTrigger>
          </TabsList>
          <div className="mt-6">
            <TabsContent value={TAB_INFO}>
              <ClassInfoTab
                academyClass={academyClass}
                classId={classId}
                canManageStatus={canManageStatus}
              />
            </TabsContent>
            <TabsContent value={TAB_SYLLABUS}>
              <ClassSyllabusTab courseProfileId={academyClass?.cohort?.courseProfileId} />
            </TabsContent>
            <TabsContent value={TAB_STUDENTS}>
              <ClassStudentsTab
                classId={classId}
                canManageEnrollment={canManageEnrollment}
              />
            </TabsContent>
            <TabsContent value={TAB_DISCUSSION}>
              <ClassDiscussionTab classId={classId} />
            </TabsContent>
            {availableTabs.schedule && (
              <TabsContent value={TAB_SCHEDULE}>
                <ClassAttendanceTab classId={classId} academyClass={academyClass} />
              </TabsContent>
            )}
            {availableTabs.assignments && (
              <TabsContent value={TAB_ASSIGNMENTS}>
                <ClassAssignmentsTab classId={classId} />
              </TabsContent>
            )}
            <TabsContent value={TAB_RESOURCES}>
              <ClassResourcesTab classId={classId} />
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  )
}
