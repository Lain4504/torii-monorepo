import { useAppSelector } from "@/hooks/hooks"
import { selectUser } from "@/store/slices/auth-slice"
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
  Clock,
  Video,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Zap,
  Target,
  ShieldAlert
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

// --- Sub-components for Roles ---

function StatsCard({ title, value, sub, icon: Icon, trend, colorClass }: any) {
  return (
    <Card className="group relative overflow-hidden rounded-xl bg-background border border-border/50 hover:border-primary/20 transition-all duration-300 shadow-sm hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 italic">{title}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg bg-muted/50 text-muted-foreground/50 group-hover:bg-primary/5 group-hover:text-primary transition-colors duration-300", colorClass?.replace('bg-', 'text-').replace('500', '600'))}>
          <Icon className="size-4.5" />
        </div>
      </CardHeader>

      <CardContent className="pb-6">
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md mb-0.5">
              <ArrowUpRight className="size-3" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground/60 mt-2 leading-relaxed">
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard
          title="Tổng Doanh Thu"
          value="1.145.000₫"
          sub="Tăng trưởng doanh thu ổn định"
          icon={DollarSign}
          trend="+20%"
          colorClass="bg-emerald-500"
        />
        <StatsCard
          title="Học viên Hoạt động"
          value="2,350"
          sub="Người dùng đang trực tuyến cao"
          icon={Users}
          trend="+12%"
          colorClass="bg-blue-500"
        />
        <StatsCard
          title="Tổng Khóa học"
          value="120"
          sub="Nội dung bài giảng đã tối ưu"
          icon={BookOpen}
          colorClass="bg-primary"
        />
        <StatsCard
          title="Trạng thái Hệ thống"
          value="99.9%"
          sub="Mọi dịch vụ hoạt động bình thường"
          icon={Activity}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
        {/* Big Chart Area */}
        <Card className="col-span-4 rounded-xl bg-background border border-border/50 shadow-sm overflow-hidden group">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic tracking-wide uppercase">
                <TrendingUp className="size-3" />
                Thống kê Tăng trưởng
              </div>
            </div>
            <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Tổng quan <span className="text-primary">Hiệu suất</span></CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/60 mt-1">Chỉ số doanh thu & đăng ký Quý 1 2026</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-3 bg-muted/5 rounded-lg border border-dashed border-border/40 hover:bg-primary/[0.02] transition-colors duration-300">
              <div className="p-3 rounded-lg bg-background shadow-sm border border-border/20">
                <Activity className="size-5 text-primary/40" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/40">Đang tải dữ liệu biểu đồ...</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 rounded-xl bg-background border border-border/50 shadow-sm">
          <CardHeader className="p-6 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-serif font-bold italic tracking-wide uppercase mb-3">
              <DollarSign className="size-3" />
              Hoạt động Gần đây
            </div>
            <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Giao dịch <span className="text-amber-500">Mới nhất</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/60 mt-1">Các giao dịch đã được xác nhận</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-3">
              <SaleItem name="Nguyễn Văn A" email="Đăng ký khóa học Premium" amount="+1.299.000₫" />
              <SaleItem name="Trần Thị B" email="Luyện thi N3 Cấp tốc" amount="+499.000₫" />
              <SaleItem name="Lê Văn C" email="Gia hạn VIP Membership" amount="+299.000₫" />
              <SaleItem name="Phạm Thị D" email="Buổi học kèm riêng 1:1" amount="+150.000₫" />
            </div>
            <Button variant="ghost" className="w-full mt-6 h-10 rounded-lg border border-border/30 text-[10px] font-serif font-bold italic uppercase tracking-wide hover:bg-primary/5 hover:text-primary transition-all group">
              Xem tất cả giao dịch
              <ChevronRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <StatsCard title="Chờ Phê duyệt" value="04" sub="Khóa học chờ kiểm duyệt nội dung" icon={Zap} trend="Cần xử lý" colorClass="bg-rose-500" />
        <StatsCard title="Lịch thi" value="12" sub="Kỳ thi được lên lịch tuần này" icon={Calendar} colorClass="bg-blue-500" />
        <StatsCard title="Hỗ trợ" value="08" sub="Yêu cầu hỗ trợ đang mở" icon={Activity} colorClass="bg-amber-500" />
        <StatsCard title="Nhân viên Online" value="15" sub="Thành viên đang trực tuyến" icon={Users} colorClass="bg-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card className="rounded-xl bg-background border border-border/50 shadow-sm">
          <CardHeader className="p-6 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-semibold tracking-wide uppercase mb-3">
              <Target className="size-3" />
              Công việc
            </div>
            <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Yêu cầu <span className="text-primary">Hành động</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/60 mt-1">Các tác vụ vận hành hàng ngày</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            <TaskItem title="Duyệt nội dung video 'N5 Ngữ pháp'" status="Khẩn cấp" code="R-502" />
            <TaskItem title="Phê duyệt đơn đăng ký Giảng viên #124" status="Chờ duyệt" code="L-102" />
            <TaskItem title="Kiểm tra Ngân hàng câu hỏi JLPT N3" status="Rà soát" code="Q-309" />
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-background border border-border/50 shadow-sm">
          <CardHeader className="p-6 pb-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full text-[10px] font-serif font-bold italic tracking-wide uppercase mb-3">
              <BookOpen className="size-3" />
              Cập nhật
            </div>
            <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Hoạt động <span className="text-amber-500">Khóa học</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/60 mt-1">Cảnh báo và cập nhật gần đây</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-2">
              {[
                { name: "Kanji Foundation", update: "Đã sửa bởi Staff", time: "2h trước", status: "NHÁP" },
                { name: "N2 Listening Pro", update: "Đã tải video lên", time: "5h trước", status: "LIVE" },
                { name: "Kaiwa Masterclass", update: "Cập nhật ảnh bìa", time: "8h trước", status: "XEM XÉT" }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 border border-transparent hover:border-border/30 group cursor-pointer">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-semibold uppercase tracking-wide truncate group-hover:text-primary transition-colors">{c.name}</h4>
                    <p className="text-[10px] text-muted-foreground/60">{c.update} • <span className="text-foreground/40">{c.time}</span></p>
                  </div>
                  <div className="ml-4 px-2 py-0.5 rounded-md bg-muted/20 border border-border/10 text-[9px] font-bold uppercase tracking-wide group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6 h-10 rounded-lg bg-foreground text-background font-serif font-bold italic uppercase tracking-wide text-[10px] shadow-sm hover:translate-y-[-1px] transition-all group">
              Duyệt Khóa học
              <ChevronRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LecturerDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section - Zen Style */}
      <div className="relative group rounded-xl border border-primary/10 bg-background/50 backdrop-blur-xl p-8 lg:p-10 overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-700">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] -z-10 rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
          <div className="space-y-5 flex-1 max-w-2xl">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-serif font-bold italic tracking-wide animate-pulse uppercase">
                <Video className="h-3 w-3" />
                Phiên Trực tiếp
              </div>
            </div>
            <h2 className="text-4xl font-serif font-bold italic tracking-tight text-foreground leading-tight uppercase">Masterclass <br /><span className="text-primary/60">Hội thoại N4</span></h2>
            <p className="text-sm font-medium text-muted-foreground/70 leading-relaxed border-l-2 border-primary/20 pl-4 max-w-lg hidden lg:block">
              "Chuẩn bị kỹ cho buổi Kaiwa hôm nay. Tập trung vào các cấu trúc câu phức và phản xạ ngữ pháp N4."
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="space-y-0.5">
                <p className="text-[9px] font-serif font-bold italic uppercase tracking-widest text-muted-foreground/40">Lịch trình</p>
                <span className="flex items-center gap-2 text-xs font-semibold"><Calendar className="h-3.5 w-3.5 text-primary" /> Hôm nay, 14:00</span>
              </div>
              <div className="space-y-0.5">
                <p className="text-[9px] font-serif font-bold italic uppercase tracking-widest text-muted-foreground/40">Tham dự</p>
                <span className="flex items-center gap-2 text-xs font-semibold"><Users className="h-3.5 w-3.5 text-primary" /> 24 Đã đăng ký</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse rounded-full" />
            <Button size="lg" className="relative h-12 px-8 rounded-xl bg-primary text-primary-foreground font-serif font-bold italic uppercase tracking-wide text-[10px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-300 group">
              Tham gia Ngay
              <ArrowUpRight className="ml-2 size-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card className="rounded-xl bg-background border border-border/50 shadow-sm p-1">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Lịch trình <span className="text-primary">Giảng dạy</span></CardTitle>
              <div className="p-2 rounded-lg bg-muted/20"><Calendar className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-xs font-medium text-muted-foreground/60">Các lớp học và sự kiện sắp tới của bạn</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-2">
            {[
              { title: "Nền tảng Ngữ pháp N5", time: "Ngày mai, 09:00", level: "N5", color: "text-emerald-500" },
              { title: "Tổng hợp Đọc hiểu N3", time: "Thứ Tư, 10:00", level: "N3", color: "text-blue-500" },
              { title: "CLB Kaiwa Hàng tuần", time: "Thứ Sáu, 18:00", level: "ALL", color: "text-primary" }
            ].map((s, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-lg hover:bg-muted/30 transition-all duration-200 cursor-pointer border border-transparent hover:border-border/20">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-[10px] text-muted-foreground/50 flex items-center gap-2">
                    <Clock className="size-3" /> {s.time}
                  </p>
                </div>
                <div className={cn("text-[9px] font-bold px-2 py-0.5 rounded-md bg-background ring-1 ring-border/20 uppercase tracking-wide", s.color)}>{s.level}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-background border border-border/50 shadow-sm p-1">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-xl font-serif font-bold italic tracking-tight text-foreground uppercase">Hàng đợi <span className="text-amber-500">Bài tập</span></CardTitle>
              <div className="p-2 rounded-lg bg-muted/20"><Zap className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-xs font-medium text-muted-foreground/60">Đánh giá đang chờ xử lý</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-2">
              {[
                { name: "Minh Lê", task: "Viết sáng tạo N4", time: "Nộp 2h trước", avatar: "ML" },
                { name: "Sarah Trần", task: "Tiểu luận Đạo đức N3", time: "Nộp 5h trước", avatar: "ST" },
                { name: "Tanaka Ken", task: "Email Thương mại N2", time: "Nộp 1 ngày trước", avatar: "TK" }
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-all duration-200 group group cursor-pointer border border-transparent hover:border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-[10px] transition-all group-hover:scale-105">
                      {a.avatar}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold uppercase tracking-wide text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground/50">{a.task} • <span className="text-foreground/30">{a.time}</span></p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[9px] font-bold uppercase tracking-wide border border-border/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">Chấm điểm</Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 h-10 rounded-lg border border-border/20 text-[10px] font-bold uppercase tracking-wide opacity-50 hover:opacity-100 hover:bg-muted/30 transition-all">Xem tất cả</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Helper Components ---

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center group cursor-pointer transition-all duration-300 hover:bg-muted/30 rounded-lg p-2.5 -mx-2.5 border border-transparent hover:border-border/30">
      <div className="h-9 w-9 rounded-md bg-primary/5 flex items-center justify-center text-primary font-bold text-[10px] mr-3 transition-all duration-300 border border-primary/10 group-hover:border-primary/20">
        {name[0]}
      </div>
      <div className="space-y-0.5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">{name}</p>
        <p className="text-[10px] text-muted-foreground/50">{email}</p>
      </div>
      <div className="ml-auto font-bold text-foreground text-xs">{amount}</div>
    </div>
  )
}

function TaskItem({ title, status, code }: { title: string, status: string, code: string }) {
  const isUrgent = status === 'Khẩn cấp';
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer group border border-border/10 hover:border-primary/20">
      <div className={cn(
        "w-8 h-8 flex items-center justify-center rounded-md transition-all duration-300 group-hover:scale-105",
        isUrgent ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
      )}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/40">{code}</span>
          <div className="w-0.5 h-0.5 rounded-full bg-border" />
          <span className={cn("text-[9px] font-bold uppercase tracking-wider", isUrgent ? "text-rose-500" : "text-primary/50")}>{status}</span>
        </div>
      </div>
      <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-40 transition-all -translate-y-1 group-hover:translate-x-1" />
    </div>
  )
}

// --- Main Page Component ---

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
    <div className="space-y-8 pb-32">
      {/* Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative px-1">
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-serif font-bold italic tracking-wide uppercase mb-1 animate-in fade-in slide-in-from-left-4 duration-500">
            <Sparkles className="size-3" />
            Bảng điều khiển Tổng quan
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold italic tracking-tight text-foreground leading-[0.9] uppercase animate-in fade-in slide-in-from-bottom-4 duration-700">
            {getGreeting()}, <br />
            <span className="text-primary not-italic">{user?.displayName?.split(' ')[0] || 'Quản trị viên'}</span>.
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-4 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Chào mừng trở lại Torii Platform Dashboard
          </p>
        </div>
        <div className="flex items-center gap-3 pt-6 md:pt-0 animate-in fade-in zoom-in-95 duration-1000 delay-200">
          <Button variant="outline" className="h-11 px-6 rounded-xl bg-background border-border/40 text-muted-foreground hover:text-foreground font-serif font-bold italic uppercase tracking-wide text-[10px] hover:bg-muted/30 transition-all group">
            Thống kê
            <TrendingUp className="ml-2 size-3.5 opacity-40 group-hover:opacity-100 transition-all" />
          </Button>
          <Button className="h-11 px-6 rounded-xl bg-primary text-white font-serif font-bold italic uppercase tracking-wide text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group">
            Xuất Dữ liệu
            <ArrowUpRight className="ml-2 size-3.5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Ambient section breaks */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-8" />

        {role === 'admin' && <AdminDashboard />}
        {role === 'staff' && <StaffDashboard />}
        {role === 'lecturer' && <LecturerDashboard />}

        {!['admin', 'staff', 'lecturer'].includes(role || '') && (
          <div className="p-20 text-center space-y-4 bg-muted/10 rounded-xl border border-dashed border-border/40">
            <ShieldAlert className="size-12 text-muted-foreground/20 mx-auto" strokeWidth={1} />
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/40">Truy cập bị Hạn chế</p>
              <p className="text-base font-medium text-foreground">Giao diện quản trị không khả dụng cho vai trò của bạn.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
