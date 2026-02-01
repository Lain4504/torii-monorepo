import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    RefreshCw,
    CreditCard,
    ArrowDownRight,
    Filter,
    Download,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { usePlatformOverview } from "../../api/services/analytics"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
    Cell,
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

const revenueChartConfig = {
    total: {
        label: "Doanh thu",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig

export default function RevenueAnalytics() {
    const { data: overview, isLoading, refetch } = usePlatformOverview()

    if (isLoading) return <PageLoading />

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
    }

    const revenueByLevelData = overview?.revenueByLevel?.sort((a, b) => b.amount - a.amount) || []

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
            {/* Header */}
            <PageHeader
                title={<span>Phân tích <span className="text-emerald-500">Doanh thu</span></span>}
                subtitle="Theo dõi dòng tiền, tăng trưởng và hiệu suất kinh doanh trên từng phân khúc khóa học."
                stats={[
                    { label: "Tổng doanh thu", value: formatCurrency(overview?.overview.totalRevenue || 0) },
                    { label: "Đơn hàng hoàn tất", value: overview?.overview.totalEnrollments.toLocaleString() || "0" }
                ]}
                actions={
                    <>
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-bold uppercase text-[10px] tracking-widest hover:bg-muted/30 transition-all flex items-center gap-2">
                            <Filter className="size-3.5" />
                            Lọc dữ liệu
                        </Button>
                        <Button variant="outline" className="h-10 px-4 rounded-xl border-border/40 font-bold uppercase text-[10px] tracking-widest hover:bg-muted/30 transition-all flex items-center gap-2">
                            <Download className="size-3.5" />
                            Xuất báo cáo
                        </Button>
                        <Button
                            onClick={() => refetch()}
                            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold uppercase text-[10px] tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            <RefreshCw className="size-3.5" />
                            Làm mới
                        </Button>
                    </>
                }
            />

            {/* Financial Health Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <RevenueCard
                    title="Tổng doanh thu"
                    value={formatCurrency(overview?.overview.totalRevenue || 0)}
                    sub="Tích lũy từ khi hệ thống bắt đầu"
                    icon={DollarSign}
                    trend="+12.5%"
                    trendUp={true}
                />
                <RevenueCard
                    title="Doanh thu dự kiến (MTD)"
                    value={formatCurrency((overview?.overview.totalRevenue || 0) * 0.15)} // Mock
                    sub="Tháng này so với tháng trước"
                    icon={TrendingUp}
                    trend="+8.2%"
                    trendUp={true}
                />
                <RevenueCard
                    title="Giá trị đơn hàng TB"
                    value={formatCurrency(overview?.overview.totalEnrollments ? (overview.overview.totalRevenue / overview.overview.totalEnrollments) : 0)}
                    sub="Trung bình trên mỗi giao dịch"
                    icon={CreditCard}
                />
                <RevenueCard
                    title="Tỷ lệ hoàn trả"
                    value="1.2%"
                    sub="Các yêu cầu hoàn tiền đã xử lý"
                    icon={ArrowDownRight}
                    trend="-0.5%"
                    trendUp={false}
                    inverseColor
                />
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 md:grid-cols-12">
                <Card className="md:col-span-8 rounded-2xl border-border/40 shadow-sm bg-card overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-lg font-bold uppercase tracking-tight">Biểu đồ <span className="text-primary">Tăng trưởng</span></CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Doanh thu 6 tháng gần nhất</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ChartContainer config={revenueChartConfig} className="w-full h-full">
                            <AreaChart data={overview?.growthData || []}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => `${val / 1000000}M`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#revenueGradient)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4 rounded-2xl border-border/40 shadow-sm bg-card">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Doanh thu <span className="text-emerald-500">Cấp độ</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Báo cáo theo trình độ JLPT (N5 - N1)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueByLevelData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="level" type="category" axisLine={false} tickLine={false} fontSize={12} width={40} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/95 border border-border/50 p-2 rounded-lg shadow-xl backdrop-blur-sm">
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{payload[0].payload.level}</p>
                                                    <p className="text-sm font-black text-emerald-500">{formatCurrency(payload[0].value as number)}</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={30}>
                                    {revenueByLevelData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${(index % 5) + 1}))`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <Card className="rounded-2xl border-border/40 shadow-sm bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Giao dịch <span className="text-primary">Gần đây</span></CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase text-muted-foreground/40 font-mono">Chi tiết các đơn hàng vừa hoàn thành</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-[10px] font-bold uppercase text-muted-foreground hover:text-primary">Xem tất cả</Button>
                </CardHeader>
                <CardContent>
                    <div className="relative overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="pb-4 text-[10px] font-bold uppercase text-muted-foreground/40 px-4">Đơn hàng</th>
                                    <th className="pb-4 text-[10px] font-bold uppercase text-muted-foreground/40 px-4">Khách hàng</th>
                                    <th className="pb-4 text-[10px] font-bold uppercase text-muted-foreground/40 px-4">Số tiền</th>
                                    <th className="pb-4 text-[10px] font-bold uppercase text-muted-foreground/40 px-4">Thời gian</th>
                                    <th className="pb-4 text-[10px] font-bold uppercase text-muted-foreground/40 px-4">Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {overview?.recentSales.map((sale, i) => (
                                    <tr key={i} className="group hover:bg-muted/20 transition-colors">
                                        <td className="py-4 px-4">
                                            <span className="text-xs font-mono font-bold text-muted-foreground/60">#{sale.id.slice(-8).toUpperCase()}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div>
                                                <p className="text-xs font-bold uppercase text-foreground">{sale.userName}</p>
                                                <p className="text-[10px] text-muted-foreground/40 font-medium">{sale.userEmail}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-xs font-bold text-foreground">{formatCurrency(Number(sale.amount))}</td>
                                        <td className="py-4 px-4 text-[10px] font-medium text-muted-foreground/60">{new Date(sale.date).toLocaleString('vi-VN')}</td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Success</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function RevenueCard({ title, value, sub, icon: Icon, trend, trendUp, inverseColor }: any) {
    return (
        <Card className="rounded-2xl border-border/40 shadow-sm bg-card group overflow-hidden relative">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <Icon className="size-5" />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md",
                            trendUp ? (inverseColor ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500") :
                                (inverseColor ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")
                        )}>
                            {trend}
                            <ArrowUpRight className={cn("size-3", !trendUp && "rotate-90")} />
                        </div>
                    )}
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
