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
    TrendingUp,
    RefreshCw,
    Zap,
    UserCheck,
    UserMinus,
    MapPin,
    Calendar,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useUserAnalytics } from "../../api/services/analytics"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts'
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@workspace/ui/components/chart"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { PageHeader } from "@/components/common/page-header"

const userChartConfig = {
    count: {
        label: "Học viên",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export default function UserAnalytics() {
    const { data: userStats, isLoading, refetch } = useUserAnalytics()

    if (isLoading) return <PageLoading />

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Header */}
            <PageHeader
                title={<span>Phân tích <span className="text-purple-500">Học viên</span></span>}
                subtitle="Tìm hiểu chân dung học viên, tốc độ tăng trưởng và hành vi tương tác trên nền tảng."
                stats={[
                    { label: "Tổng học viên", value: userStats?.roles.reduce((acc, curr) => acc + curr.count, 0).toLocaleString() || "0" },
                    { label: "Hoạt động (7d)", value: "84%" }
                ]}
                actions={
                    <Button
                        onClick={() => refetch()}
                        className="h-10 px-6 rounded-xl bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <RefreshCw className="size-3.5" />
                        Làm mới
                    </Button>
                }
            />

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <AnalyticsCard
                    title="Tổng học viên"
                    value={userStats?.roles.reduce((acc, curr) => acc + curr.count, 0).toLocaleString() || "0"}
                    sub="Tổng số tài khoản đã đăng ký"
                    icon={Users}
                    colorClass="text-purple-500 bg-purple-500/10"
                />
                <AnalyticsCard
                    title="Học viên Mới (30d)"
                    value={`+${userStats?.monthlyGrowth?.[userStats.monthlyGrowth.length - 1]?.count || 0}`}
                    sub="Tốc độ tăng trưởng tháng này"
                    icon={TrendingUp}
                    colorClass="text-emerald-500 bg-emerald-500/10"
                />
                <AnalyticsCard
                    title="Tỷ lệ Active"
                    value="84%"
                    sub="Học viên truy cập trong 7 ngày qua"
                    icon={UserCheck}
                    colorClass="text-blue-500 bg-blue-500/10"
                />
                <AnalyticsCard
                    title="Churn Rate"
                    value="2.5%"
                    sub="Tỷ lệ học viên ngừng gia hạn"
                    icon={UserMinus}
                    colorClass="text-rose-500 bg-rose-500/10"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                {/* Registration Growth Chart */}
                <Card className="md:col-span-12 lg:col-span-8 rounded-2xl border-border/40 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Tăng trưởng <span className="text-primary">Đăng ký</span></CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Thống kê học viên mới theo tháng</CardDescription>
                        </div>
                        <Calendar className="size-4 text-muted-foreground/20" />
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ChartContainer config={userChartConfig} className="w-full h-full">
                            <AreaChart data={userStats?.monthlyGrowth || []}>
                                <defs>
                                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={3} fill="url(#growthGradient)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Audience Mix */}
                <Card className="md:col-span-12 lg:col-span-4 rounded-2xl border-border/40 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Cơ cấu <span className="text-purple-500">Vai trò</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Phân loại người dùng hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {userStats?.roles.sort((a, b) => b.count - a.count).map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-transparent hover:border-border/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-lg bg-background flex items-center justify-center border border-border/10 group-hover:scale-105 transition-transform">
                                        <UserCheck className={cn("size-5", role.role === 'admin' ? "text-amber-500" : "text-primary")} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold uppercase text-foreground">{role.role}</p>
                                        <p className="text-[9px] text-muted-foreground/40 font-black uppercase">User Role</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-foreground">{role.count.toLocaleString()}</p>
                                    <p className="text-[8px] font-bold uppercase text-muted-foreground/40">Thành viên</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Momentum */}
                <Card className="rounded-2xl border-border/40 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Xung nhịp <span className="text-emerald-500">Hoạt động</span></CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Tương tác hệ thống trong 14 ngày qua</CardDescription>
                        </div>
                        <Zap className="size-4 text-emerald-500 animate-pulse" />
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userStats?.activityTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/95 border border-border/50 p-2 rounded-lg shadow-xl backdrop-blur-sm">
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Ngày {payload[0].payload.date}</p>
                                                    <p className="text-sm font-black text-emerald-500">{payload[0].value} Tương tác</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area type="stepAfter" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="hsl(var(--chart-2))" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Geographical Distribution Mock */}
                <Card className="rounded-2xl border-border/40 shadow-sm bg-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Vị trí <span className="text-blue-500">Người học</span></CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Phân bổ học viên theo khu vực chính</CardDescription>
                        </div>
                        <MapPin className="size-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RegionItem label="Hà Nội" count="45%" color="bg-blue-500" />
                        <RegionItem label="Hồ Chí Minh" count="32%" color="bg-emerald-500" />
                        <RegionItem label="Đà Nẵng" count="12%" color="bg-amber-500" />
                        <RegionItem label="Nhật Bản (Expats)" count="8%" color="bg-purple-500" />
                        <RegionItem label="Khác" count="3%" color="bg-muted" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function AnalyticsCard({ title, value, sub, icon: Icon, colorClass }: any) {
    return (
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card group overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl transition-all", colorClass)}>
                        <Icon className="size-5" />
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">{title}</p>
                    <h3 className="text-2xl font-black tracking-tight text-foreground">{value}</h3>
                    <p className="text-[9px] font-medium text-muted-foreground/60 pt-1 uppercase italic border-l-2 border-border/30 pl-3">{sub}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function RegionItem({ label, count, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground/60">{label}</span>
                <span className="text-foreground">{count}</span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: count }} />
            </div>
        </div>
    )
}
