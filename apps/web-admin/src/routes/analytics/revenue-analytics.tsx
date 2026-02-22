import { useState } from "react"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@workspace/ui/components/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table"
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
    Download
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
import { Spinner } from "@workspace/ui/components/spinner";

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
                        <Filter className="mr-2 size-4" />
                        Lọc dữ liệu
                    </Button>
                    <ExportReportDialog />
                    <Button
                        onClick={() => refetch()}
                    >
                        <RefreshCw className={cn("mr-2 size-4", isLoading && "animate-spin")} />
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
                <Card className="md:col-span-8 overflow-hidden">
                <CardHeader>
                    <CardTitle>Biểu đồ Tăng trưởng</CardTitle>
                    <CardDescription>Doanh thu 6 tháng gần nhất</CardDescription>
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
                    <CardTitle>Doanh thu theo Cấp độ</CardTitle>
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
            <Card>
                <CardHeader>
                    <CardTitle>Giao dịch Gần đây</CardTitle>
                    <CardDescription>Chi tiết các đơn hàng vừa hoàn thành</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Đơn hàng</TableHead>
                                <TableHead>Khách hàng</TableHead>
                                <TableHead>Số tiền</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {overview?.recentSales.map((sale, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono">{sale.id.slice(-8).toUpperCase()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{sale.userName}</div>
                                        <div className="text-xs text-muted-foreground">{sale.userEmail}</div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{formatCurrency(Number(sale.amount))}</TableCell>
                                    <TableCell className="text-muted-foreground">{formatDateTime(sale.date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">Hoàn tất</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

function RevenueCard({ title, value, sub, icon: Icon, trend, trendUp, inverseColor }: any) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{sub}</p>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs mt-1",
                        trendUp ? (inverseColor ? "text-rose-500" : "text-emerald-500") :
                            (inverseColor ? "text-emerald-500" : "text-rose-500")
                    )}>
                        <span>{trend}</span>
                        <ArrowUpRight className={cn("size-4", !trendUp && "rotate-90")} />
                    </div>
                )}
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xuất báo cáo</DialogTitle>
                    <DialogDescription>
                        Chọn khoảng thời gian và loại báo cáo để xuất dưới dạng tập tin Excel.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Từ ngày</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">Đến ngày</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Loại báo cáo</Label>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4"
                            onClick={() => handleExport("revenue")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
                                {isExporting === "revenue" ? <Spinner /> : <TrendingUp className="size-4" />}
                            </div>
                            <div className="ml-4 text-left">
                                <p className="font-semibold">Báo cáo Doanh thu</p>
                                <p className="text-xs text-muted-foreground">Thống kê hiệu suất bán khóa học.</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4"
                            onClick={() => handleExport("orders")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                                {isExporting === "orders" ? <Spinner /> : <CreditCard className="size-4" />}
                            </div>
                            <div className="ml-4 text-left">
                                <p className="font-semibold">Nhật ký Đơn hàng</p>
                                <p className="text-xs text-muted-foreground">Chi tiết các giao dịch thanh toán.</p>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start h-auto p-4"
                            onClick={() => handleExport("balance")}
                            disabled={!!isExporting}
                        >
                            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
                                {isExporting === "balance" ? <Spinner /> : <RefreshCw className="size-4" />}
                            </div>
                            <div className="ml-4 text-left">
                                <p className="font-semibold">Biến động Số dư</p>
                                <p className="text-xs text-muted-foreground">Lịch sử nạp, trừ và hoàn trả coin.</p>
                            </div>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
