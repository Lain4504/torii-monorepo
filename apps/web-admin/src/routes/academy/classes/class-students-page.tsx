import { useEffect, useMemo } from "react"
import { useParams, Link, useSearchParams } from "react-router-dom"
import { PageHeader } from "@/components/common/page-header"
import { ChevronRight, Users, CalendarCheck, FileText, Info, MessageSquare } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useAcademyClass } from "@/lib/api/services/academy-classes"
import { useAuth } from "@/hooks/use-auth"
import { UserRole, isStaffBranchRole } from "@workspace/schemas"
import { ClassInfoTab } from "./tabs/class-info-tab"
import { ClassStudentsTab } from "./tabs/class-students-tab"
import { ClassDiscussionTab } from "./tabs/class-discussion-tab"
import { ClassAttendanceTab } from "@/components/academy/class-attendance-tab"
import { ClassAssignmentsTab } from "./tabs/class-assignments-tab"

const TAB_INFO = "info"
const TAB_STUDENTS = "students"
const TAB_DISCUSSION = "discussion"
const TAB_SCHEDULE = "schedule"
const TAB_ASSIGNMENTS = "assignments"

export default function ClassStudentsPage() {
  const { classId } = useParams<{ classId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: academyClass, isLoading: isLoadingClass } = useAcademyClass(classId)
  const { user } = useAuth()

  const isStaffOrAdmin = user?.role === UserRole.ADMIN || isStaffBranchRole(user?.role)

  const mode = academyClass?.mode as "VOD" | "LIVE" | undefined

  const defaultTab = TAB_INFO

  const tabParam = searchParams.get("tab") || defaultTab

  const availableTabs = useMemo(() => {
    if (!mode) return { info: true, students: true, schedule: false, assignments: false }
    if (mode === "VOD") {
      return { info: true, students: true, discussion: true, schedule: false, assignments: false }
    }
    return { info: true, students: true, discussion: true, schedule: true, assignments: true }
  }, [mode])

  const activeTab = useMemo(() => {
    if (!availableTabs.schedule && tabParam === TAB_SCHEDULE) return defaultTab
    if (!availableTabs.assignments && tabParam === TAB_ASSIGNMENTS) return defaultTab
    if (
      tabParam === TAB_INFO ||
      tabParam === TAB_SCHEDULE ||
      tabParam === TAB_ASSIGNMENTS ||
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
    if (isLoadingClass || !mode) return
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
  }, [mode, tabParam, availableTabs, isLoadingClass, setSearchParams])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Link
              to="/academy/classes"
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
            ? `Quản lý học viên, lịch học & điểm danh${mode === "LIVE" ? ", bài tập" : ""} của lớp ${academyClass.code}.`
            : "Quản lý chi tiết lớp học."
        }
        stats={
          academyClass
            ? [
                { label: "Mã lớp", value: academyClass.code },
                { label: "Loại hình", value: mode === "LIVE" ? "LIVE" : "VOD" },
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
              Thông tin lớp học
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
          </TabsList>
          <div className="mt-6">
            <TabsContent value={TAB_INFO}>
              <ClassInfoTab
                academyClass={academyClass}
                classId={classId}
                canManageStatus={isStaffOrAdmin}
              />
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
          </div>
        </Tabs>
      )}
    </div>
  )
}
