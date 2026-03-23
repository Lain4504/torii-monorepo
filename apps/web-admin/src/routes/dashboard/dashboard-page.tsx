import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { Link } from "react-router-dom"
import { Button } from "@workspace/ui/components/button"
import { Zap, ShieldAlert } from "lucide-react"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { PageHeader } from "@/components/common/page-header"
import { isAdminPortalRole, UserRole } from "@workspace/schemas"

// Dashboards
import AdminDashboardV2 from "@/components/dashboard/admin-dashboard-v2"
import StaffAcademicDashboard from "@/components/dashboard/staff-academic-dashboard"
import StaffFinanceDashboard from "@/components/dashboard/staff-finance-dashboard"
import LecturerDashboard from "@/components/dashboard/lecturer-dashboard"

export default function DashboardPage() {
  const user = useAppSelector(selectUser)
  const role = user?.role

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  const isLecturer = role === UserRole.LECTURER
  const isStaffAcademic = role === UserRole.STAFF_ACADEMIC
  const isStaffFinance = role === UserRole.STAFF_OPERATIONS

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${getGreeting()}, ${user?.displayName?.split(' ')[0] || 'ADMIN'}`}
        subtitle={
          isLecturer
            ? "Bảng điều khiển giảng viên • Quản lý lớp học và buổi giảng"
            : isStaffAcademic
              ? "Bảng điều khiển học thuật • Nội dung, lớp học và phê duyệt"
              : isStaffFinance
                ? "Bảng điều khiển tài chính • Đơn hàng, doanh thu và hỗ trợ giao dịch"
                : "Bảng chỉ huy trung tâm Torii Admin"
        }
        actions={
          isLecturer ? (
            <Button asChild size="sm" className="font-semibold">
              <Link to="/academy/classes">Lớp của tôi</Link>
            </Button>
          ) : isStaffAcademic ? (
            <div className="flex items-center gap-3">
              <ButtonGroup>
                <Button variant="outline" asChild size="sm">
                  <Link to="/academy/approvals">Approval Center</Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link to="/academy/classes">Lớp học</Link>
                </Button>
              </ButtonGroup>
              <Button size="sm" asChild>
                <Link to="/academy/course-profiles">
                  <Zap className="size-4 mr-2" />
                  Nội dung
                </Link>
              </Button>
            </div>
          ) : isStaffFinance ? (
            <div className="flex items-center gap-3">
              <ButtonGroup>
                <Button variant="outline" asChild size="sm">
                  <Link to="/orders">Đơn hàng</Link>
                </Button>
                <Button variant="outline" asChild size="sm">
                  <Link to="/coupons">Coupons</Link>
                </Button>
              </ButtonGroup>
              <Button size="sm" asChild>
                <Link to="/tickets">
                  <Zap className="size-4 mr-2" />
                  Hỗ trợ
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <ButtonGroup>
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
          )
        }
      />

      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-8" />

        {role === UserRole.ADMIN && <AdminDashboardV2 />}
        {isStaffAcademic && <StaffAcademicDashboard />}
        {isStaffFinance && <StaffFinanceDashboard />}
        {role === UserRole.LECTURER && <LecturerDashboard />}

        {(!role || !isAdminPortalRole(role)) && (
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
