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
    <Card className="group relative overflow-hidden rounded-[2rem] bg-background/50 backdrop-blur-3xl border border-white/20 hover:border-primary/30 transition-all duration-700 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
      <div className={cn("absolute top-0 right-0 w-32 h-32 blur-[80px] -z-10 rounded-full opacity-5 transition-opacity group-hover:opacity-10", colorClass)} />

      <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
        <div className="space-y-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">{title}</p>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 text-muted-foreground/50 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-medium tracking-tight text-foreground">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
              <ArrowUpRight className="size-3" />
              {trend}
            </div>
          )}
        </div>
        <p className="text-xs font-medium text-muted-foreground/50 mt-2 leading-relaxed">
          {sub}
        </p>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <StatsCard
          title="Total Revenue"
          value="$45,231"
          sub="Consistent revenue growth this quarter"
          icon={DollarSign}
          trend="+20%"
          colorClass="bg-emerald-500"
        />
        <StatsCard
          title="Active Learners"
          value="2,350"
          sub="High concurrent active users"
          icon={Users}
          trend="+12%"
          colorClass="bg-blue-500"
        />
        <StatsCard
          title="Course Catalog"
          value="12K"
          sub="Optimized lecture content available"
          icon={BookOpen}
          colorClass="bg-primary"
        />
        <StatsCard
          title="System Status"
          value="99.9%"
          sub="All services operating normally"
          icon={Activity}
          colorClass="bg-amber-500"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        {/* Big Chart Area */}
        <Card className="col-span-4 rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm overflow-hidden group">
          <CardHeader className="p-8 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide">
                <TrendingUp className="size-3.5" />
                Growth Analytics
              </div>
            </div>
            <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Overview <span className="text-primary italic">Statistics</span></CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground/50 mt-1">Revenue & Enrollment metrics for Q1 2026</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 bg-muted/10 rounded-[2rem] border border-dashed border-border/40 m-2 group-hover:bg-primary/[0.02] transition-colors duration-500 p-8">
              <div className="p-4 rounded-2xl bg-background/50 shadow-sm">
                <Activity className="size-6 text-primary/40 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-muted-foreground/40">Loading Chart Data...</p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="col-span-3 rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm">
          <CardHeader className="p-8 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-medium tracking-wide mb-4">
              <DollarSign className="size-3.5" />
              Recent Activity
            </div>
            <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Latest <span className="text-amber-500 italic">Transactions</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/50 mt-1">Verified purchases & enrollments</p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-4">
              <SaleItem name="John Doe" email="Premium Course Purchase" amount="+$1,299" />
              <SaleItem name="Alice Smith" email="N3 Mastery Enrollment" amount="+$499.00" />
              <SaleItem name="Bob Jones" email="VIP Membership Renew" amount="+$299.00" />
              <SaleItem name="Elena Vance" email="Private Tutoring Session" amount="+$150.00" />
            </div>
            <Button variant="ghost" className="w-full mt-8 h-12 rounded-xl border border-border/20 text-xs font-medium uppercase tracking-wide hover:bg-primary/5 hover:text-primary transition-all group">
              View All Transactions
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
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <StatsCard title="Pending Review" value="04" sub="Courses waiting for content approval" icon={Zap} trend="Critical" colorClass="bg-rose-500" />
        <StatsCard title="Scheduled Exams" value="12" sub="Exams scheduled this week" icon={Calendar} colorClass="bg-blue-500" />
        <StatsCard title="Support Desk" value="08" sub="Active support tickets" icon={Activity} colorClass="bg-amber-500" />
        <StatsCard title="Active Staff" value="15" sub="Team members online" icon={Users} colorClass="bg-primary" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <Card className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm p-2">
          <CardHeader className="p-8 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide mb-4">
              <Target className="size-3.5" />
              Tasks
            </div>
            <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Pending <span className="text-primary italic">Actions</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/50 mt-1">Daily operational tasks</p>
          </CardHeader>
          <CardContent className="px-6 pb-8 space-y-3">
            <TaskItem title="Review 'N5 Grammar' video content" status="Urgent" code="R-502" />
            <TaskItem title="Approve Lecturer Application #124" status="Pending" code="L-102" />
            <TaskItem title="Verify Question Bank for JLPT N3" status="Review" code="Q-309" />
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm p-2">
          <CardHeader className="p-8 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-medium tracking-wide mb-4">
              <BookOpen className="size-3.5" />
              Updates
            </div>
            <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Course <span className="text-amber-500 italic">Activity</span></CardTitle>
            <p className="text-xs font-medium text-muted-foreground/50 mt-1">Recent alerts and updates</p>
          </CardHeader>
          <CardContent className="px-6 pb-8">
            <div className="space-y-2">
              {[
                { name: "Kanji Foundation", update: "Modified by Staff", time: "2h ago", status: "DRAFT" },
                { name: "N2 Listening Pro", update: "Videos Uploaded", time: "5h ago", status: "LIVE" },
                { name: "Kaiwa Masterclass", update: "Thumbnail Updated", time: "8h ago", status: "REVIEW" }
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/30 transition-all duration-300 border border-transparent hover:border-border/20 group cursor-pointer">
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-medium uppercase tracking-wide truncate group-hover:text-primary transition-colors">{c.name}</h4>
                    <p className="text-[10px] text-muted-foreground/60">{c.update} • <span className="text-foreground/40">{c.time}</span></p>
                  </div>
                  <div className="ml-4 px-2.5 py-0.5 rounded-full bg-background border border-border/20 text-[9px] font-medium uppercase tracking-wide group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    {c.status}
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8 h-12 rounded-xl bg-foreground text-background font-medium uppercase tracking-wide text-[10px] shadow-lg hover:shadow-xl transition-all active:scale-[0.98] group">
              Open Content Repository
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
    <div className="space-y-8">
      {/* Hero Section - Zen Style */}
      <div className="relative group rounded-[3rem] border border-primary/10 bg-background/50 backdrop-blur-3xl p-8 lg:p-12 overflow-hidden shadow-xl shadow-primary/5 animate-in fade-in zoom-in-95 duration-1000">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-blue-500/5 blur-[100px] -z-10 rounded-full" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
          <div className="space-y-6 flex-1 max-w-2xl">
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-medium tracking-wide animate-pulse">
                <Video className="h-3.5 w-3.5" />
                Live Session
              </div>
            </div>
            <h2 className="text-5xl font-serif font-medium tracking-tight text-foreground leading-tight">N4 Conversation <br /><span className="text-primary/40 italic">Masterclass</span></h2>
            <p className="text-sm font-medium text-muted-foreground/60 leading-relaxed border-l-2 border-primary/20 pl-6 max-w-lg hidden lg:block">
              "Prepare thoroughly for today's Kaiwa session. Focus on complex sentence structures and N4 grammar reflexes."
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Schedule</p>
                <span className="flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4 text-primary" /> Today, 14:00</span>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/40">Attendance</p>
                <span className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4 text-primary" /> 24 Registered</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-3xl opacity-10 animate-pulse rounded-full" />
            <Button size="lg" className="relative h-16 px-10 rounded-[2rem] bg-primary text-white font-medium uppercase tracking-wide text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-500 group">
              Join Now
              <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <Card className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm p-4">
          <CardHeader className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Teaching <span className="text-primary italic">Timeline</span></CardTitle>
              <div className="p-2 rounded-xl bg-muted/20"><Calendar className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-xs font-medium text-muted-foreground/50">Your upcoming classes and events</p>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-2">
            {[
              { title: "N5 Grammar Foundation", time: "Tomorrow, 09:00 AM", level: "N5", color: "text-emerald-500" },
              { title: "N3 Reading Synthesis", time: "Wed, 10:00 AM", level: "N3", color: "text-blue-500" },
              { title: "Weekly Kaiwa Club", time: "Fri, 18:00 PM", level: "ALL", color: "text-primary" }
            ].map((s, i) => (
              <div key={i} className="group flex items-center justify-between p-5 rounded-[1.5rem] hover:bg-primary/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-primary/10">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium tracking-tight group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-[10px] text-muted-foreground/50 flex items-center gap-2">
                    <Clock className="size-3" /> {s.time}
                  </p>
                </div>
                <div className={cn("text-[9px] font-medium px-2.5 py-0.5 rounded-full bg-background ring-1 ring-border/20 uppercase tracking-wide", s.color)}>{s.level}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] bg-background/50 backdrop-blur-3xl border border-white/20 shadow-sm p-4">
          <CardHeader className="p-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-2xl font-serif font-medium tracking-tight text-foreground">Assignment <span className="text-amber-500 italic">Queue</span></CardTitle>
              <div className="p-2 rounded-xl bg-muted/20"><Zap className="size-4 text-muted-foreground/40" /></div>
            </div>
            <p className="text-xs font-medium text-muted-foreground/50">Pending evaluations</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="space-y-2">
              {[
                { name: "Minh Le", task: "N4 Creative Writing", time: "Submitted 2h ago", avatar: "ML" },
                { name: "Sarah Chen", task: "N3 Ethics Essay", time: "Submitted 5h ago", avatar: "SC" },
                { name: "Tanaka Ken", task: "N2 Business Mail", time: "Submitted 1d ago", avatar: "TK" }
              ].map((a, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-muted/30 transition-all duration-300 group group cursor-pointer border border-transparent hover:border-border/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-medium text-[10px] transition-all group-hover:scale-105">
                      {a.avatar}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-medium uppercase tracking-wide text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground/50">{a.task} • <span className="text-foreground/30">{a.time}</span></p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="h-9 rounded-lg px-3 text-[10px] font-medium uppercase tracking-wide border border-border/20 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">Grade</Button>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-6 h-12 rounded-xl border border-border/10 text-[10px] font-medium uppercase tracking-wide opacity-50 hover:opacity-100 transition-opacity">View All</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Helper Components ---

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center group cursor-pointer transition-all duration-500 hover:bg-primary/5 rounded-2xl p-3 -mx-2 border border-transparent hover:border-primary/5">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-medium text-[10px] mr-4 transition-all duration-500 border border-primary/5">
        {name[0]}
      </div>
      <div className="space-y-0.5 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">{name}</p>
        <p className="text-[10px] text-muted-foreground/50">{email}</p>
      </div>
      <div className="ml-auto font-medium text-foreground text-sm">{amount}</div>
    </div>
  )
}

function TaskItem({ title, status, code }: { title: string, status: string, code: string }) {
  const isUrgent = status === 'Urgent';
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-primary/5 transition-all duration-300 cursor-pointer group border border-border/10 hover:border-primary/20">
      <div className={cn(
        "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105",
        isUrgent ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
      )}>
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-wide text-foreground group-hover:text-primary transition-colors leading-tight">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/40">{code}</span>
          <div className="w-0.5 h-0.5 rounded-full bg-border" />
          <span className={cn("text-[9px] font-medium uppercase tracking-wider", isUrgent ? "text-rose-500" : "text-primary/50")}>{status}</span>
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
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  return (
    <div className="space-y-8 pb-24 selection:bg-primary/20 selection:text-primary">
      {/* Header Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative px-2">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-medium tracking-wide mb-2 animate-in fade-in slide-in-from-left-4 duration-500">
            <Sparkles className="size-3.5" />
            Dashboard Overview
          </div>
          <h2 className="text-5xl font-serif font-medium tracking-tight text-foreground leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {getGreeting()}, <br />
            <span className="text-primary italic">{user?.displayName?.split(' ')[0] || 'User'}</span>.
          </h2>
          <p className="text-sm font-medium italic border-l-2 border-primary/20 pl-6 mt-8 text-muted-foreground/60 leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Welcome back to <span className="text-foreground/80 not-italic">Torii Platform</span>. Your systems are running smoothly.
          </p>
        </div>
        <div className="flex items-center gap-4 pt-6 md:pt-0 animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <Button className="h-14 px-8 rounded-2xl bg-background border border-border/10 shadow-lg text-foreground font-medium uppercase tracking-wide text-[10px] hover:bg-primary/5 hover:text-primary transition-all duration-500 group">
            Analytics
            <TrendingUp className="ml-3 size-4 opacity-40 group-hover:opacity-100 transition-all" />
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-primary text-white font-medium uppercase tracking-wide text-[10px] shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-500 group">
            Export Data
            <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
          <div className="p-20 text-center space-y-4 bg-muted/10 rounded-[3rem] border border-dashed border-border/40">
            <ShieldAlert className="size-12 text-muted-foreground/20 mx-auto" strokeWidth={1} />
            <div className="space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">Access Restricted</p>
              <p className="text-base font-medium text-foreground">Admin interface is not available for your role.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
