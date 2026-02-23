import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
  Users,
  BookOpen,
  DollarSign,
  Activity,
  Calendar,
  Video,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  Zap,
  Target,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
  FileSearch,
  History,
  Terminal,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { usePlatformOverview } from "@/lib/api/services/analytics"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { Badge } from "@workspace/ui/components/badge"
import { ButtonGroup } from "@workspace/ui/components/button-group"

// --- Real-world Operational Dashboards ---

function StatsCard({ title, value, sub, icon: Icon, trend, highlight }: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      highlight && "ring-1 ring-primary/20"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg bg-muted/50 text-muted-foreground/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-300")}>
          <Icon className="size-4.5" />
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          {trend && (
            <Badge variant="secondary" className="text-[10px]">
              <ArrowUpRight className="size-3" />
              {trend}
            </Badge>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground/60 mt-1">
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  const { data, isLoading } = usePlatformOverview()

  if (isLoading) return <div className="h-96 flex items-center justify-center"><PageLoading /></div>

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const overview = data?.overview

  return (
    <div className="space-y-8">
      {/* Priority Action Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard
          title="Yêu cầu Hoàn tiền"
          value={overview?.pendingRefunds || 0}
          sub="Cần xử lý ngay lập tức"
          icon={AlertCircle}
          highlight={Number(overview?.pendingRefunds) > 0}
        />
        <StatsCard
          title="Duyệt Khóa học"
          value={overview?.pendingApprovals || 0}
          sub="Đang chờ kiểm định nội dung"
          icon={FileSearch}
          highlight={Number(overview?.pendingApprovals) > 0}
        />
        <StatsCard
          title="Lớp học Trực tiếp"
          value={overview?.activeRooms || 0}
          sub="Phiên live đang diễn ra"
          icon={Video}
        />
        <StatsCard
          title="Doanh thu Hôm nay"
          value={formatCurrency(overview?.totalRevenue ? overview.totalRevenue / 30 : 0)} // Mocked daily for demo
          sub="Cập nhật 5 phút trước"
          icon={DollarSign}
          trend="+5%"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        {/* Operational Queue */}
        <Card className="md:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hàng đợi <span className="text-primary">vận hành</span></CardTitle>
                <CardDescription>Tác vụ cần xử lý ưu tiên từ cao xuống thấp</CardDescription>
              </div>
              <Button size="sm" variant="ghost">
                Xem toàn bộ <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {/* Pending Refund Item */}
              {Number(overview?.pendingRefunds) > 0 && (
                <OperationItem
                  icon={DollarSign}
                  title="Phê duyệt Hoàn tiền #RF-5902"
                  desc="Học viên: Lê Minh - Lý do: Nội dung không phù hợp"
                  tag="KHẨN CẤP"
                  tagColor="rose"
                  time="15 phút trước"
                  link="/tickets"
                />
              )}
              {/* Pending Course Approval */}
              <OperationItem
                icon={BookOpen}
                title="Kiểm duyệt: Khóa học N3 Cấp tốc"
                desc="Giảng viên: Tanaka Sensei - 24 bài giảng mới"
                tag="NỘI DUNG"
                tagColor="amber"
                time="1 giờ trước"
                link="/reviews"
              />
              {/* High Value Transaction */}
              <OperationItem
                icon={Zap}
                title="Đơn hàng Giá trị cao #ORD-882"
                desc="Giao dịch 2.500.000đ - Đang chờ xác nhận ngân hàng"
                tag="TÀI CHÍNH"
                tagColor="primary"
                time="3 giờ trước"
                link="/orders"
              />
              {/* System Audit */}
              <OperationItem
                icon={ShieldAlert}
                title="Cảnh báo: Đăng nhập thất bại hàng loạt"
                desc="Phát hiện 12 attempts từ IP lạ 1.5.234.xx"
                tag="BẢO MẬT"
                tagColor="rose"
                time="6 giờ trước"
                link="/audit-logs"
              />
              <OperationItem
                icon={MessageSquare}
                title="Ticket Hỗ trợ mới #ST-992"
                desc="Không thể truy cập Mobile App trên iOS 17"
                tag="SUPPORT"
                tagColor="blue"
                time="8 giờ trước"
                link="/tickets"
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Pulse */}
        <div className="md:col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tổng quan hệ thống</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <PulseMetric label="Người dùng Trực tuyến" value={overview?.activeToday || 0} color="emerald" icon={Activity} />
              <PulseMetric label="Phòng học Active" value={overview?.activeRooms || 0} color="primary" icon={Video} />
              <PulseMetric label="Ticket Đang mở" value={overview?.pendingTickets || 0} color="amber" icon={MessageSquare} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                <CardTitle>Nhật ký hoạt động</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <LogItem time="12:45" user="Admin" action="Cập nhật cấu hình Coupon" />
              <LogItem time="12:32" user="System" action="Tự động gia hạn 12 Subscription" />
              <LogItem time="11:58" user="Sarah" action="Phê duyệt User 'Nguyễn Văn A'" />
              <LogItem time="10:15" user="Linh" action="Phản hồi Ticket #991" />
              <Button variant="link" className="w-full text-xs font-semibold text-muted-foreground/60 hover:text-primary h-auto p-0 pt-2 shadow-none">
                Xem Log chi tiết <History className="ml-1.5 size-3.5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function OperationItem({ icon: Icon, title, desc, tag, tagColor, time, link }: any) {
  const colorClasses: any = {
    rose: "bg-rose-500/10 text-rose-500",
    amber: "bg-amber-500/10 text-amber-500",
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-500/10 text-blue-500",
    emerald: "bg-emerald-500/10 text-emerald-500"
  }
  return (
    <div className="group flex items-center gap-4 p-5 hover:bg-muted/10 transition-all cursor-pointer">
      <div className={cn("size-12 flex items-center justify-center rounded-xl bg-background transition-colors group-hover:bg-muted/20 group-hover:shadow-sm", colorClasses[tagColor]?.split(' ')[1])}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{title}</h4>
          <Badge variant="outline" className={cn("text-[10px] font-medium py-0 h-4 border-none", colorClasses[tagColor])}>{tag}</Badge>
        </div>
        <p className="text-xs text-muted-foreground/60 truncate">{desc}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] font-medium text-muted-foreground/40 mb-1">{time}</p>
        <Link to={link}>
          <Button variant="ghost" size="sm" className="font-semibold hover:bg-primary/5 hover:text-primary">Xử lý</Button>
        </Link>
      </div>
    </div>
  )
}

function PulseMetric({ label, value, color, icon: Icon }: any) {
  const colors: any = {
    emerald: "bg-emerald-500",
    primary: "bg-primary",
    amber: "bg-amber-500"
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn("size-2 rounded-full animate-pulse", colors[color])} />
        <span className="text-xs font-semibold text-muted-foreground/70">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{value.toLocaleString()}</span>
        {Icon && <Icon className="size-4 text-muted-foreground/30" />}
      </div>
    </div>
  )
}

function LogItem({ time, user, action }: any) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] font-semibold text-muted-foreground/40 pt-0.5">{time}</span>
      <div className="space-y-0.5">
        <p className="text-xs font-bold text-foreground">{user}</p>
        <p className="text-xs font-medium text-muted-foreground/70 leading-relaxed">{action}</p>
      </div>
    </div>
  )
}

function StaffDashboard() {
  const { data } = usePlatformOverview()
  const overview = data?.overview

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard title="Chờ Phê duyệt" value={overview?.pendingApprovals || 0} sub="Khóa học đang chờ rà soát" icon={Zap} highlight={Number(overview?.pendingApprovals) > 0} />
        <StatsCard title="Lịch Live" value={overview?.activeRooms || 0} sub="Buổi dạy trực tiếp hôm nay" icon={Calendar} />
        <StatsCard title="Ticket Mới" value={overview?.pendingTickets || 0} sub="Cần phản hồi hỗ trợ" icon={MessageSquare} highlight={Number(overview?.pendingTickets) > 0} />
        <StatsCard title="Người dùng" value={overview?.totalUsers || 0} sub="Học viên đã tham gia" icon={Users} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card>
          <CardHeader>
            <CardTitle>Kế hoạch vận hành</CardTitle>
            <CardDescription>Danh sách công việc cần làm trong ca trực</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            <TaskItem title="Duyệt video 'Mina no Nihongo Bài 12'" status="Khẩn cấp" code="CONT-502" />
            <TaskItem title="Verify danh tính Giảng viên mới" status="Bình thường" code="USER-102" />
            <TaskItem title="Check chất lượng Room #LIVE-29" status="Ưu tiên" code="SYS-309" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cập nhật giảng viên</CardTitle>
            <CardDescription>Phản hồi và câu hỏi từ đội ngũ giảng dạy</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              <OperationItem icon={MessageSquare} title="Tanaka Sensei: Lỗi Live Stream" desc="Room #LIVE-24 bị delay âm thanh" tag="Lỗi" tagColor="rose" time="10m" link="/tickets" />
              <OperationItem icon={BookOpen} title="Linh Nguyễn: Bài tập mới" desc="Vừa cập nhật bộ đề JLPT N4 mới" tag="Review" tagColor="amber" time="45m" link="/reviews" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LecturerDashboard() {
  return (
    <div className="space-y-6">
      <div className="relative group rounded-xl border border-primary/10 bg-card p-8 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] -z-10 rounded-full" />
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-xs font-semibold">PHỔ BIẾN</Badge>
            <h2 className="text-4xl font-bold tracking-tight">Masterclass <span className="text-primary">Kaiwa N4</span></h2>
            <p className="text-sm font-semibold text-muted-foreground/70">Bắt đầu sau: <span className="text-primary animate-pulse">24 phút 32 giây</span></p>
            <div className="flex gap-4 pt-2">
              <Button className="rounded-xl font-bold text-xs px-8 py-5 h-auto transition-all shadow-md">Vào Lớp Ngay</Button>
              <Button variant="outline" className="rounded-xl font-bold text-xs px-8 py-5 h-auto border-border/50">Chuẩn bị tài liệu</Button>
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-4 translate-x-10 opacity-30">
            <div className="size-20 rounded-2xl bg-muted rotate-3 border border-border/50" />
            <div className="size-20 rounded-2xl bg-muted -rotate-12 border border-border/50 translate-y-4" />
            <div className="size-20 rounded-2xl bg-muted rotate-12 border border-border/50" />
            <div className="size-20 rounded-2xl bg-muted -rotate-3 border border-border/50 translate-y-2" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard title="Bài tập cần chấm" value="12" sub="Học viên đang chờ kết quả" icon={Target} highlight />
        <StatsCard title="Câu hỏi chưa trả lời" value="05" sub="Tương tác mới từ bài giảng" icon={MessageSquare} highlight />
        <StatsCard title="Lượt xem mới" value="1.2k" sub="Hiệu suất video trong 24h" icon={Activity} />
      </div>
    </div>
  )
}

function TaskItem({ title, status, code }: { title: string, status: string, code: string }) {
  const isUrgent = status === 'Khẩn cấp';
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer group border border-border/10 hover:border-primary/20">
      <div className={cn(
        "size-10 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105",
        isUrgent ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
      )}>
        <CheckCircle2 className="size-4.5" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground/40">{code}</span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span className={cn("text-[10px] font-bold uppercase", isUrgent ? "text-rose-500" : "text-primary/70")}>{status}</span>
        </div>
      </div>
      <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-40 transition-all -translate-y-1 group-hover:translate-x-1" />
    </div>
  )
}

import { PageHeader } from "@/components/common/page-header"

export default function DashboardPage() {
  const user = useAppSelector(selectUser)
  const role = user?.role

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
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

        {role === 'admin' && <AdminDashboard />}
        {(role === 'staff' || role?.startsWith('staff-')) && <StaffDashboard />}
        {role === 'lecturer' && <LecturerDashboard />}

        {!['admin', 'staff', 'lecturer'].includes(role || '') && !role?.startsWith('staff-') && (
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
