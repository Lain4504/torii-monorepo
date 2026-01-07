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
  ChevronRight
} from "lucide-react"

// --- Sub-components for Roles ---

// --- Sub-components for Roles ---
// Minimal Zen Stats Card
function StatsCard({ title, value, sub, icon: Icon }: any) {
  return (
    <Card className="zen-card overflow-hidden relative group">
      <div className="absolute right-0 top-0 h-16 w-16 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="text-xs zen-text-muted mt-1 font-medium">{sub}</p>
      </CardContent>
    </Card>
  )
}

function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value="$45,231" sub="+20.1% from last month" icon={DollarSign} />
        <StatsCard title="Active Users" value="2,350" sub="+180 new this week" icon={Users} />
        <StatsCard title="Courses Active" value="12" sub="4 pending approval" icon={BookOpen} />
        <StatsCard title="System Health" value="99.9%" sub="All systems operational" icon={Activity} />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-7">
        {/* Big Chart Area */}
        <Card className="col-span-4 zen-card">
          <CardHeader>
            <CardTitle className="text-xl">Overview</CardTitle>
            <CardDescription>Monthly revenue & enrollment trends</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] flex items-center justify-center text-muted-foreground/40 bg-muted/20 rounded-2xl m-2 border border-dashed border-muted">
              [Interactive Chart Component]
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3 zen-card">
          <CardHeader>
            <CardTitle className="text-xl">Recent Sales</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <SaleItem name="John Doe" email="john@example.com" amount="+$1,999" />
              <SaleItem name="Alice Smith" email="alice@example.com" amount="+$39.00" />
              <SaleItem name="Bob Jones" email="bob@example.com" amount="+$299.00" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StaffDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="zen-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">4</div>
            <p className="text-xs zen-text-muted mt-1">Courses waiting for review</p>
          </CardContent>
        </Card>
        <Card className="zen-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
            <p className="text-xs zen-text-muted mt-1">Scheduled for this week</p>
          </CardContent>
        </Card>
        <Card className="zen-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">8</div>
            <p className="text-xs zen-text-muted mt-1">2 high priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="zen-card">
          <CardHeader>
            <CardTitle>Tasks & To-Dos</CardTitle>
            <CardDescription>Daily operations management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <TaskItem title="Review 'N5 Grammar' content" status="info" />
            <TaskItem title="Approve Lecturer Application #124" status="warn" />
            <TaskItem title="Update Question Bank for N3" status="success" />
          </CardContent>
        </Card>
        <Card className="zen-card">
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>Recent updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SaleItem name="Introduction to Kanji" email="Updated 2h ago" amount="Draft" />
            </div>
            <Button className="w-full mt-6 rounded-xl" variant="outline">View All Courses</Button>
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
      <div className="rounded-3xl border-none bg-gradient-to-r from-primary/20 via-primary/5 to-background p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-background/50 backdrop-blur rounded-full w-fit">
              <Video className="text-primary h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">Live Now</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">N4 Conversation Practice</h2>
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Today</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 14:00 - 15:30</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 12 Students</span>
            </div>
          </div>
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 text-base h-12">Join Class Now</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="zen-card">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your weekly teaching plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScheduleItem title="N5 Grammar Foundation" time="Tomorrow, 09:00 AM" />
              <ScheduleItem title="N3 Reading Comprehension" time="Wed, 10:00 AM" />
              <ScheduleItem title="Kaiwa Club" time="Fri, 18:00 PM" />
            </div>
          </CardContent>
        </Card>

        <Card className="zen-card">
          <CardHeader>
            <CardTitle>Pending Assignments</CardTitle>
            <CardDescription>Requires your detailed feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border/50">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Minh Le</p>
                  <p className="text-xs text-muted-foreground">N4 Writing Task</p>
                </div>
                <Button size="sm" variant="secondary" className="rounded-full px-4">Grade</Button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">N3 Essay</p>
                </div>
                <Button size="sm" variant="secondary" className="rounded-full px-4">Grade</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Helper Components ---

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center group">
      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mr-3 group-hover:scale-110 transition-transform">
        {name[0]}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
      <div className="ml-auto font-medium">{amount}</div>
    </div>
  )
}

function TaskItem({ title, status }: { title: string, status: 'info' | 'warn' | 'success' }) {
  const color = status === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
    status === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer group">
      <div className={`p-1 rounded-full ${status === 'success' ? 'bg-emerald-200/50' : 'bg-muted'} group-hover:scale-110 transition-transform`}>
        <CheckCircle2 className={`h-4 w-4 ${status === 'success' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
      </div>
      <span className="text-sm font-medium text-foreground/80">{title}</span>
      <span className={`ml-auto text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${color}`}>{status}</span>
    </div>
  )
}

function ScheduleItem({ title, time }: { title: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border-l-4 border-l-primary/40 hover:bg-muted/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="pl-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {time}
          </p>
        </div>
      </div>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-background">
        <ChevronRight className="h-4 w-4 opacity-50" />
      </Button>
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
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            {getGreeting()}, {user?.displayName || 'User'}
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening in your workspace today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>Download Reports</Button>
        </div>
      </div>

      {role === 'admin' && <AdminDashboard />}
      {role === 'staff' && <StaffDashboard />}
      {role === 'lecturer' && <LecturerDashboard />}

      {/* Fallback if no role matched or learner (should be guarded) */}
      {!['admin', 'staff', 'lecturer'].includes(role || '') && (
        <div className="p-8 text-center text-muted-foreground">
          Dashboard view not available for this role.
        </div>
      )}
    </div>
  )
}
