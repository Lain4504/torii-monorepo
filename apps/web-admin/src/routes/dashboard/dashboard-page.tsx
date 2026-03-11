import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Zap, ShieldAlert } from "lucide-react"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { PageHeader } from "@/components/common/page-header"
import { UserRole } from "@workspace/schemas"

// Dashboards
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import StaffDashboard from "@/components/dashboard/staff-dashboard"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard"
import AcademyManagementMock from "@/routes/academy/management-mock"

export default function DashboardPage() {
  const user = useAppSelector(selectUser)
  const role = user?.role as any // Use any to avoid the "no overlap" error for now if it persists

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  // Redirect staff-lms to Academy Dashboard as per requirement
  if (role === UserRole.STAFF_LMS || role === 'staff-lms') {
    return <AcademyManagementMock />
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${getGreeting()}, ${user?.displayName?.split(' ')[0] || 'ADMIN'}`}
        subtitle={`Bảng chỉ huy trung tâm Torii Admin`}
        actions={
          <div className="flex items-center gap-3">
            <ButtonGroup>
              <Button variant="outline" asChild size="sm">
                <Link to="/analytics/revenue">Tài chính</Link>
              </Button>
              <Button variant="outline" asChild size="sm">
                <Link to="/analytics/learning">Học tập</Link>
              </Button>
              <Button variant="outline" asChild size="sm">
                <Link to="/analytics/users">Học viên</Link>
              </Button>
            </ButtonGroup>
            <Button size="sm">
              <Zap className="size-4 mr-2" />
              Lệnh nhanh
            </Button>
          </div>
        }
      />

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-8" />

        {role === UserRole.ADMIN && <AdminDashboard />}
        {(role === UserRole.STAFF || (role && role.toString().startsWith('staff-'))) && role !== UserRole.STAFF_LMS && <StaffDashboard />}
        {role === UserRole.LECTURER && <LecturerDashboard />}

        {!role || (![UserRole.ADMIN, UserRole.STAFF, UserRole.LECTURER, UserRole.STAFF_LMS].includes(role) && !role.toString().startsWith('staff-')) && (
          <div className="p-20 text-center space-y-4 bg-muted/10 rounded-xl border border-dashed border-border/40">
            <ShieldAlert className="size-12 text-muted-foreground/30 mx-auto" />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Truy cập bị hạn chế</p>
              <p className="text-base font-semibold">Giao diện quản trị không khả dụng cho vai trò của bạn ({role}).</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
