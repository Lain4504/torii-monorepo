import { useState } from "react"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog"
import {
    DollarSign,
    TrendingUp,
    ArrowUpRight,
    RefreshCw,
    CreditCard,
    ArrowDownRight,
    Filter,
    Download,
    Loader2,
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { usePlatformOverview } from "../../api/services/analytics"
import { formatDateTime } from "@/lib/format-utils"
import { reportApi } from "../../api/services/reports"
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
        color: "var(--primary)",
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
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Phân tích Doanh thu"
                subtitle="Theo dõi dòng tiền, tăng trưởng và hiệu suất kinh doanh trên từng phân khúc khóa học."
                stats={[
                    { label: "Tổng doanh thu", value: formatCurrency(overview?.overview.totalRevenue || 0) },
                    { label: "Đơn hàng hoàn tất", value: overview?.overview.totalEnrollments.toLocaleString() || "0" }
                ]}
                actions={
                    <>
                        <Button variant="outline">
                            <Filter />
                            Lọc dữ liệu
                        </Button>
                        <ExportReportDialog />
                        <Button
                            onClick={() => refetch()}
                        >
                            Làm mới
                            <RefreshCw className={cn(isLoading && "animate-spin")} />
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
                <Card className="md:col-span-8 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Biểu đồ <span className="text-primary">Tăng trưởng</span></CardTitle>
                            <CardDescription>Doanh thu 6 tháng gần nhất</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        <ChartContainer config={revenueChartConfig} className="w-full h-full">
                            <AreaChart data={overview?.growthData || []}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => `${val / 1000000}M`} />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={3} fill="url(#revenueGradient)" />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Doanh thu <span className="text-emerald-500">Cấp độ</span></CardTitle>
                        <CardDescription>Báo cáo theo trình độ JLPT (N5 - N1)</CardDescription>
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
                                        <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions Table */}
            <div className="rounded-xl border bg-card overflow-hidden">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold">Giao dịch Gần đây</h3>
                    <p className="text-sm text-muted-foreground">Chi tiết các đơn hàng vừa hoàn thành</p>
                </div>
                <div className="relative overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-muted/30">
                                <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase">Đơn hàng</th>
                                <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase">Khách hàng</th>
                                <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase">Số tiền</th>
                                <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase">Thời gian</th>
                                <th className="h-10 px-4 text-xs font-semibold text-muted-foreground uppercase">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {overview?.recentSales.map((sale, i) => (
                                <tr key={i} className="hover:bg-muted/30 transition-colors">
                                    <td className="py-4 px-4">
                                        <span className="text-xs font-mono font-medium">#{sale.id.slice(-8).toUpperCase()}</span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold">{sale.userName}</p>
                                            <p className="text-xs text-muted-foreground">{sale.userEmail}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-sm font-semibold">{formatCurrency(Number(sale.amount))}</td>
                                    <td className="py-4 px-4 text-xs text-muted-foreground">{formatDateTime(sale.date, 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="py-4 px-4">
                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-none">Hoàn tất</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function RevenueCard({ title, value, sub, icon: Icon, trend, trendUp, inverseColor }: any) {
    return (
        <Card className="group overflow-hidden relative">
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

function ExportReportDialog() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isExporting, setIsExporting] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    const handleExport = async (type: "orders" | "balance" | "revenue") => {
        try {
            setIsExporting(type);
            toast.info(`Đang tạo báo cáo ${type === 'orders' ? 'đơn hàng' : type === 'balance' ? 'biến động số dư' : 'doanh thu'}...`);
            await reportApi.exportReport(type, startDate, endDate);
            toast.success("Xuất báo cáo thành công!");
            setOpen(false);
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Xuất báo cáo thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Download />
                    Xuất báo cáo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="uppercase tracking-widest text-lg font-bold">Xuất báo cáo</DialogTitle>
                    <DialogDescription className="text-xs">
                        Chọn khoảng thời gian và loại báo cáo để xuất dưới dạng tập tin Excel phục vụ đối soát và quản trị.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Từ ngày</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-0.5">Đến ngày</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 mt-2">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 block ml-0.5">Loại báo cáo</Label>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4 gap-4"
                            onClick={() => handleExport("revenue")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg shrink-0">
                                {isExporting === "revenue" ? <Loader2 className="size-4 animate-spin" /> : <TrendingUp className="size-4" />}
                            </div>
                            <div className="flex flex-col items-start gap-1 text-left">
                                <span className="font-bold">Báo cáo Doanh thu</span>
                                <span className="text-xs font-normal text-muted-foreground whitespace-normal">Thống kê hiệu suất bán khóa học và doanh thu quy đổi.</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4 gap-4"
                            onClick={() => handleExport("orders")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg shrink-0">
                                {isExporting === "orders" ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                            </div>
                            <div className="flex flex-col items-start gap-1 text-left">
                                <span className="font-bold">Nhật ký Đơn hàng</span>
                                <span className="text-xs font-normal text-muted-foreground whitespace-normal">Chi tiết các giao dịch thanh toán thành công.</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4 gap-4"
                            onClick={() => handleExport("balance")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg shrink-0">
                                {isExporting === "balance" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                            </div>
                            <div className="flex flex-col items-start gap-1 text-left">
                                <span className="font-bold">Biến động Số dư</span>
                                <span className="text-xs font-normal text-muted-foreground whitespace-normal">Lịch sử nạp, trừ và hoàn trả coin của học viên.</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
