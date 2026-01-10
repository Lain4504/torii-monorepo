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
    <Card className="group relative overflow-hidden rounded-[2.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 hover:border-primary/30 transition-all duration-700 shadow-sm hover:shadow-2xl hover:shadow-primary/5 cursor-pointer">
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 rounded-full opacity-10 transition-opacity group-hover:opacity-20", colorClass)} />

      <CardHeader className="flex flex-row items-center justify-between pb-6 space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">{title}</p>
        </div>
        <div className="p-3.5 rounded-2xl bg-muted/20 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-[5deg]">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        <div className="flex items-baseline gap-2">
          <h3 className="text-4xl font-black tracking-tight text-foreground uppercase italic">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
              <ArrowUpRight className="size-3" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-[11px] font-bold text-muted-foreground/60 mt-3 italic leading-relaxed border-l-2 border-primary/10 pl-4">
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          sub="Doanh thu tăng trưởng ổn định trong quý"
          icon={DollarSign}
          trend="+20%"
          colorClass="bg-emerald-500"
        />
        <StatsCard
          title="Active Learners"
          value="2,350"
          sub="Số lượng học viên trực tuyến đồng thời cao"
          icon={Users}
          trend="+12%"
          colorClass="bg-blue-500"
        />
        <StatsCard
          title="Course Catalog"
          value="12K"
          sub="Hệ thống bài giảng đã được tối ưu hóa"
          icon={BookOpen}
          colorClass="bg-primary"
        />
        <StatsCard
          title="System Pulse"
          value="99.9%"
          sub="Tất cả các dịch vụ đang hoạt động tối ưu"
          icon={Activity}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 md:grid-cols-7 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        {/* Big Chart Area */}
        <Card className="col-span-4 rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm overflow-hidden group">
          <CardHeader className="p-10 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                <TrendingUp className="size-3" />
                Growth Analytics
              </div>
            </div>
            <CardTitle className="text-4xl font-black uppercase italic tracking-tight">Overview <br /><span className="text-primary not-italic">Data Visualization</span></CardTitle>
            <CardDescription className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-2">Revenue & Enrollment metrics for Q1 2026</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-0">
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/10 rounded-[2.5rem] border border-dashed border-border/40 m-2 group-hover:bg-primary/[0.02] transition-colors duration-500 p-8">
              <div className="p-4 rounded-2xl bg-background shadow-xl">
                <Activity className="size-8 text-primary/20 animate-pulse" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30 italic">Interactive Chart Hub Loading...</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm">
          <CardHeader className="p-10 pb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
              <DollarSign className="size-3" />
              Live Feed
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Recent <span className="text-amber-500 not-italic">Sales</span></CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2">Latest verified transactions</p>
          </CardHeader>
          <CardContent className="px-10 pb-10">
            <div className="space-y-6">
              <SaleItem name="John Doe" email="Premium Course Purchase" amount="+$1,299" />
              <SaleItem name="Alice Smith" email="N3 Mastery Enrollment" amount="+$499.00" />
              <SaleItem name="Bob Jones" email="VIP Membership Renew" amount="+$299.00" />
              <SaleItem name="Elena Vance" email="Private Tutoring Session" amount="+$150.00" />
            </div>
            <Button variant="ghost" className="w-full mt-10 h-14 rounded-2xl border border-border/20 text-[10px] font-black uppercase tracking-[0.25em] hover:bg-primary/5 hover:text-primary transition-all group">
              View Transaction Ledger
              <ChevronRight className="ml-2 size-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="space-y-12">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <StatsCard title="Pending Review" value="04" sub="Khóa học đang chờ phê duyệt nội dung" icon={Zap} trend="Critical" colorClass="bg-rose-500" />
        <StatsCard title="Scheduled Exams" value="12" sub="Kỳ thi năng lực diễn ra trong tuần" icon={Calendar} colorClass="bg-blue-500" />
        <StatsCard title="Support Desk" value="08" sub="Yêu cầu hỗ trợ từ phía học viên" icon={Activity} colorClass="bg-amber-500" />
        <StatsCard title="Staff Active" value="15" sub="Đội ngũ đang trực tuyến vận hành" icon={Users} colorClass="bg-primary" />
      </div>

      <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <Card className="rounded-[3.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm p-2">
          <CardHeader className="p-10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
              <Target className="size-3" />
              Task Manager
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Operations <span className="text-primary not-italic">To-Dos</span></CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2">Daily control & validation tasks</p>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-4">
            <TaskItem title="Review 'N5 Grammar' video content" status="Urgent" code="R-502" />
            <TaskItem title="Approve Lecturer Application #124" status="Pending" code="L-102" />
            <TaskItem title="Verify Question Bank for JLPT N3" status="Review" code="Q-309" />
          </CardContent>
        </Card>

        <Card className="rounded-[3.5rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm p-2">
          <CardHeader className="p-10 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/5 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-4">
              <BookOpen className="size-3" />
              Latest Updates
            </div>
            <CardTitle className="text-3xl font-black uppercase italic tracking-tight">Course <span className="text-amber-500 not-italic">Activity</span></CardTitle>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 mt-2">Dynamic course status tracking</p>
          </CardHeader>
          <CardContent className="px-8 pb-10">
            <div className="space-y-2">
              {[
                { name: "Kanji Foundation", update: "Modifed by Agent Smith", time: "2h ago", status: "DRAFT" },
                { name: "N2 Listening Pro", update: "Videos Uploaded", time: "5h ago", status: "LIVE" },
                { name: "Kaiwa Masterclass", update: "Thumbnail Updated", time: "8h ago", status: "REVIEW" }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl hover:bg-muted/30 transition-all duration-500 border border-transparent hover:border-border/20 group cursor-pointer">
                  <div className="space-y-1.5 min-w-0">
                    <h4 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{c.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground/40 italic">{c.update} • <span className="text-foreground/40">{c.time}</span></p>
                  </div>
                  <div className="ml-4 px-3 py-1 rounded-full bg-background border border-border/20 text-[9px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-10 h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] group">
              Access Central Repository
              <ChevronRight className="ml-2 size-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LecturerDashboard() {
  return (
    <div className="space-y-12">
      {/* Hero Section - Zen Style */}
      <div className="relative group rounded-[3.5rem] border border-primary/20 bg-background/40 backdrop-blur-3xl p-10 lg:p-14 overflow-hidden shadow-2xl shadow-primary/5 animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 blur-[100px] -z-10 rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
          <div className="space-y-6 flex-1 max-w-2xl">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                <Video className="h-3.5 w-3.5" />
                Sync Protocol: Active
              </div>
            </div>
            <h2 className="text-6xl font-black tracking-tight text-foreground uppercase italic leading-[0.9]">N4 Conversation <br /><span className="text-primary/20 not-italic">Masterclass</span></h2>
            <p className="text-sm font-bold text-muted-foreground/60 leading-relaxed italic border-l-2 border-primary/20 pl-8 max-w-lg hidden lg:block">
              "Chuẩn bị kỹ lưỡng cho buổi Kaiwa hôm nay. Tập trung vào cấu trúc câu phức và phản xạ ngữ pháp N4."
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Schedule Matrix</p>
                <span className="flex items-center gap-2 text-sm font-black italic"><Calendar className="h-4 w-4 text-primary" /> Today, 14:00</span>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Attendance Net</p>
                <span className="flex items-center gap-2 text-sm font-black italic"><Users className="h-4 w-4 text-primary" /> 24 Registered</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-20 animate-pulse rounded-full" />
            <Button size="lg" className="relative h-20 px-12 rounded-[2rem] bg-primary text-white font-black uppercase tracking-[0.25em] text-[13px] shadow-2xl shadow-primary/20 hover:scale-[1.05] hover:rotate-[-2deg] active:scale-95 transition-all duration-500 group">
              Establish Connection
              <ArrowUpRight className="ml-3 size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm p-4">
          <CardHeader className="p-8 pb-8">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-black uppercase italic tracking-tight italic">Teaching <span className="text-primary not-italic">Timeline</span></CardTitle>
              <div className="p-2 rounded-xl bg-muted/20"><Calendar className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Your upcoming instructional matrix</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            {[
              { title: "N5 Grammar Foundation", time: "Tomorrow, 09:00 AM", level: "N5", color: "text-emerald-500" },
              { title: "N3 Reading Synthesis", time: "Wed, 10:00 AM", level: "N3", color: "text-blue-500" },
              { title: "Weekly Kaiwa Club", time: "Fri, 18:00 PM", level: "ALL", color: "text-primary" }
            ].map((s, i) => (
              <div key={i} className="group flex items-center justify-between p-6 rounded-[2rem] hover:bg-primary/5 transition-all duration-500 cursor-pointer border border-transparent hover:border-primary/20">
                <div className="space-y-1.5">
                  <h4 className="text-[13px] font-black uppercase tracking-tight group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-[10px] font-bold text-muted-foreground/40 italic flex items-center gap-2">
                    <Clock className="size-3" /> {s.time}
                  </p>
                </div>
                <div className={cn("text-[9px] font-black px-3 py-1 rounded-full bg-background ring-1 ring-border/20", s.color)}>{s.level}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] bg-background/40 backdrop-blur-3xl border border-border/20 shadow-sm p-4">
          <CardHeader className="p-8 pb-8">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-black uppercase italic tracking-tight italic">Assignment <span className="text-amber-500 not-italic">Queue</span></CardTitle>
              <div className="p-2 rounded-xl bg-muted/20"><Zap className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Evaluation protocols required</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-3">
              {[
                { name: "Minh Le", task: "N4 Creative Writing", time: "Submitted 2h ago", avatar: "ML" },
                { name: "Sarah Chen", task: "N3 Ethics Essay", time: "Submitted 5h ago", avatar: "SC" },
                { name: "Tanaka Ken", task: "N2 Business Mail", time: "Submitted 1d ago", avatar: "TK" }
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] hover:bg-muted/30 transition-all duration-500 group group cursor-pointer border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-black text-xs transition-all group-hover:scale-110 group-hover:rotate-[5deg]">
                      {a.avatar}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-foreground">{a.name}</p>
                      <p className="text-[9px] font-bold text-muted-foreground/40 italic">{a.task} • <span className="text-foreground/20">{a.time}</span></p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-10 rounded-xl px-4 text-[9px] font-black uppercase tracking-[0.2em] border border-border/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">Grade</Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 h-12 rounded-xl border border-border/10 text-[9px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity">Access Archives</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Helper Components ---

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center group cursor-pointer transition-all duration-500 hover:bg-primary/5 rounded-3xl p-4 -mx-2 border border-transparent hover:border-primary/10">
      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs mr-4 group-hover:scale-110 group-hover:rotate-[10deg] transition-all duration-500 border border-primary/5">
        {name[0]}
      </div>
      <div className="space-y-1 flex-1">
        <p className="text-[12px] font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{name}</p>
        <p className="text-[10px] font-bold text-muted-foreground/40 italic">{email}</p>
      </div>
      <div className="ml-auto font-black italic tracking-tighter text-foreground text-lg">{amount}</div>
    </div>
  )
}

function TaskItem({ title, status, code }: { title: string, status: string, code: string }) {
  const isUrgent = status === 'Urgent';
  return (
    <div className="flex items-center gap-5 p-5 rounded-3xl bg-muted/20 hover:bg-primary/5 transition-all duration-500 cursor-pointer group border border-border/10 hover:border-primary/20">
      <div className={cn(
        "w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110",
        isUrgent ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
      )}>
        <CheckCircle2 className="h-5 w-5" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-[12px] font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/30">{code}</span>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span className={cn("text-[9px] font-black uppercase tracking-widest", isUrgent ? "text-rose-500 animate-pulse" : "text-primary/50")}>{status}</span>
        </div>
      </div>
      <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-40 transition-all -translate-y-1 group-hover:translate-x-1" />
    </div>
  )
}

// --- Main Page Component ---

export default function DashboardPage() {
  const user = useAppSelector(selectUser)
  const role = user?.role

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-12 pb-24 selection:bg-primary/20 selection:text-primary">
      {/* Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative px-1">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-2">
            <Sparkles className="size-3" />
            Intelligence Gateway Core
          </div>
          <h2 className="text-6xl font-black tracking-tight text-foreground uppercase italic leading-[0.85]">
            {getGreeting()}, <br />
            <span className="text-primary not-italic">{user?.displayName?.split(' ')[0] || 'User'}</span>
          </h2>
          <p className="text-sm font-bold text-muted-foreground/40 uppercase tracking-[0.1em] italic border-l-2 border-primary/20 pl-6 mt-6">
            Hệ thống vận hành tối ưu. Tiếp tục quản trị hành trình tri thức tại <span className="text-foreground">Torii HQ</span>.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-4 md:pt-0">
          <Button className="h-14 rounded-2xl bg-background border border-border/20 shadow-xl text-foreground font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 group">
            System Analytics
            <TrendingUp className="ml-3 size-4 opacity-40 group-hover:opacity-100 transition-all" />
          </Button>
          <Button className="h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-500 group">
            Global Export
            <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Button>
        </div>
      </div>

      <div className="relative">
        {/* Ambient section breaks */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-12" />

        {role === 'admin' && <AdminDashboard />}
        {role === 'staff' && <StaffDashboard />}
        {role === 'lecturer' && <LecturerDashboard />}

        {!['admin', 'staff', 'lecturer'].includes(role || '') && (
          <div className="p-20 text-center space-y-6 bg-muted/20 rounded-[3rem] border border-dashed border-border/40">
            <ShieldAlert className="size-16 text-muted-foreground/20 mx-auto" strokeWidth={1} />
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40">Unauthorized Identity Protocol</p>
              <p className="text-lg font-bold text-foreground italic">Giao diện quản trị không khả dụng cho định danh này.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
