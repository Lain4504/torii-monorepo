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
    MapPin
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useUserAnalytics } from "@/lib/api/services/analytics"
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
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export default function UserAnalytics() {
    const { data: userStats, isLoading, refetch } = useUserAnalytics()

    if (isLoading) return <PageLoading />

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Phân tích Học viên"
                subtitle="Tìm hiểu chân dung học viên, tốc độ tăng trưởng và hành vi tương tác trên nền tảng."
                stats={[
                    { label: "Tổng học viên", value: userStats?.roles.reduce((acc, curr) => acc + curr.count, 0).toLocaleString() || "0" },
                    { label: "Hoạt động (7d)", value: "84%" }
                ]}
                actions={
                    <Button
                        onClick={() => refetch()}
                    >
                        <RefreshCw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
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
                <Card className="md:col-span-12 lg:col-span-8 overflow-hidden">
                    <CardHeader>
                        <CardTitle>Tăng trưởng Đăng ký</CardTitle>
                        <CardDescription>Thống kê học viên mới theo tháng</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ChartContainer config={userChartConfig} className="w-full h-full">
                            <AreaChart data={userStats?.monthlyGrowth || []}>
                                <defs>
                                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="count" stroke="var(--chart-2)" strokeWidth={3} fill="url(#growthGradient)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Audience Mix */}
                <Card className="md:col-span-12 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Cơ cấu Vai trò</CardTitle>
                        <CardDescription>Phân loại người dùng hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {userStats?.roles.sort((a, b) => b.count - a.count).map((role, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-md">
                                        <UserCheck className={cn("size-5", role.role === 'admin' ? "text-amber-500" : "text-primary")} />
                                    </div>
                                    <p className="text-sm font-semibold capitalize">{role.role}</p>
                                </div>
                                <p className="text-sm font-semibold">{role.count.toLocaleString()}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Daily Momentum */}
                <Card className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Hoạt động</CardTitle>
                        <Zap className="size-4 text-emerald-500 animate-pulse" />
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={userStats?.activityTrends || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border p-2 rounded-lg shadow-lg">
                                                    <p className="text-xs text-muted-foreground">Ngày {payload[0].payload.date}</p>
                                                    <p className="text-sm font-semibold text-emerald-500">{payload[0].value} Tương tác</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area type="stepAfter" dataKey="count" stroke="var(--chart-2)" strokeWidth={2} fill="var(--chart-2)" fillOpacity={0.05} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Geographical Distribution Mock */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Vị trí Người học</CardTitle>
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
        </div >
    )
}

function AnalyticsCard({ title, value, sub, icon: Icon, colorClass }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={cn("h-4 w-4 text-muted-foreground", colorClass)} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
        </Card>
    )
}

function RegionItem({ label, count, color }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{count}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full", color)} style={{ width: count }} />
            </div>
        </div>
    )
}
