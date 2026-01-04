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
  CheckCircle2
} from "lucide-react"

// --- Sub-components for Roles ---

function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Revenue" value="$45,231.89" sub="+20.1% from last month" icon={DollarSign} />
        <StatsCard title="Active Users" value="+2350" sub="+180 new this week" icon={Users} />
        <StatsCard title="Courses Active" value="12" sub="4 pending approval" icon={BookOpen} />
        <StatsCard title="System Health" value="99.9%" sub="All systems operational" icon={Activity} />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-7">
        {/* Big Chart Area (Placeholder) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Monthly revenue and enrollment statistics.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-md m-4">
              [Revenue Chart Placeholder]
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity / Users */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest course purchases.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock Sales List */}
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Courses waiting for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Scheduled for this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">2 high priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks & To-Dos</CardTitle>
            <CardDescription>Manage your daily operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <TaskItem title="Review 'N5 Grammar' content" status="info" />
            <TaskItem title="Approve Lecturer Application #124" status="warn" />
            <TaskItem title="Update Question Bank for N3" status="success" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>Recent course updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SaleItem name="Introduction to Kanji" email="Updated 2h ago" amount="Draft" />
            </div>
            <Button className="w-full mt-4" variant="outline">View All Courses</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LecturerDashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section for Next Class */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="text-primary h-5 w-5" />
              Next Live Session
            </h2>
            <p className="text-3xl font-bold mt-2">N4 Conversation Practice</p>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Today</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 14:00 - 15:30</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> 12 Students</span>
            </div>
          </div>
          <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25">Join Class Now</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your teaching schedule for the week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScheduleItem title="N5 Grammar Foundation" time="Tomorrow, 09:00 AM" />
              <ScheduleItem title="N3 Reading Comprehension" time="Wed, 10:00 AM" />
              <ScheduleItem title="Kaiwa Club" time="Fri, 18:00 PM" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Assignments</CardTitle>
            <CardDescription>Student detailed feedback required.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Minh Le</p>
                  <p className="text-xs text-muted-foreground">N4 Writing Task</p>
                </div>
                <Button size="sm" variant="secondary">Grade</Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">N3 Essay</p>
                </div>
                <Button size="sm" variant="secondary">Grade</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// --- Helper Components ---

function StatsCard({ title, value, sub, icon: Icon }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  )
}

function SaleItem({ name, email, amount }: any) {
  return (
    <div className="flex items-center">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{name}</p>
        <p className="text-xs text-muted-foreground">{email}</p>
      </div>
      <div className="ml-auto font-medium">{amount}</div>
    </div>
  )
}

function TaskItem({ title, status }: { title: string, status: 'info' | 'warn' | 'success' }) {
  const color = status === 'warn' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
    status === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <div className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium">{title}</span>
      <span className={`ml-auto text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${color}`}>{status}</span>
    </div>
  )
}

function ScheduleItem({ title, time }: { title: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-1 bg-primary/20 rounded-full" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{time}</p>
        </div>
      </div>
      <Button variant="ghost" size="sm">Details</Button>
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
