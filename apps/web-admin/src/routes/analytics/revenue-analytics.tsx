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
import { Label } from "@workspace/ui/components/label"
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
                        <ExportRevenueSheet />
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

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@workspace/ui/components/sheet"
import { Calendar } from "@workspace/ui/components/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@workspace/ui/components/popover"
import { Calendar as CalendarIcon, XCircle, CheckCircle2 } from "lucide-react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@workspace/ui/components/item"
import { vi } from "@/lib/format-utils"

function ExportRevenueSheet() {
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [reportType, setReportType] = useState<'orders' | 'balance' | 'revenue'>("revenue");
    const [isExporting, setIsExporting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            toast.info(`Đang tạo báo cáo ${reportType === 'orders' ? 'đơn hàng' : reportType === 'balance' ? 'biến động số dư' : 'doanh thu'}...`);
            await reportApi.exportReport(reportType, startDate, endDate);
            toast.success("Xuất báo cáo thành công!");
            setOpen(false);
        } catch (error) {
            console.error("Export failed:", error);
            toast.error("Xuất báo cáo thất bại. Vui lòng thử lại sau.");
        } finally {
            setIsExporting(false);
        }
    };

    const reportTypes = [
        {
            id: "revenue",
            title: "Báo cáo Doanh thu",
            description: "Thống kê hiệu suất bán khóa học và tăng trưởng.",
            icon: TrendingUp,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            id: "orders",
            title: "Nhật ký Đơn hàng",
            description: "Chi tiết các giao dịch thanh toán và trạng thái đơn hàng.",
            icon: CreditCard,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            id: "balance",
            title: "Biến động Số dư",
            description: "Lịch sử nạp, trừ và hoàn trả coin trong hệ thống.",
            icon: RefreshCw,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        }
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <Download className="mr-2 size-4" />
                    Xuất báo cáo
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[800px] flex flex-col p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>Xuất báo cáo dữ liệu</SheetTitle>
                    <SheetDescription>
                        Chọn khoảng thời gian và loại báo cáo để xuất dưới dạng tập tin Excel.
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="flex-1">
                    <div className="space-y-8 p-6">
                        {/* Date Range Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Khoảng thời gian</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Từ ngày</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-11 justify-start text-left font-normal",
                                                    !startDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {startDate ? formatDateTime(startDate, "dd/MM/yyyy") : <span>Chọn ngày bắt đầu</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={startDate ? new Date(startDate) : undefined}
                                                onSelect={(date) => setStartDate(date ? formatDateTime(date, "yyyy-MM-dd") : '')}
                                                initialFocus
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Đến ngày</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full h-11 justify-start text-left font-normal",
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? formatDateTime(endDate, "dd/MM/yyyy") : <span>Chọn ngày kết thúc</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={endDate ? new Date(endDate) : undefined}
                                                onSelect={(date) => setEndDate(date ? formatDateTime(date, "yyyy-MM-dd") : '')}
                                                initialFocus
                                                locale={vi}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            {(startDate || endDate) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                >
                                    <XCircle className="mr-2 size-3.5" />
                                    Xóa khoảng thời gian
                                </Button>
                            )}
                        </div>

                        {/* Report Type Selection */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Loại báo cáo</h4>
                            <div className="grid gap-3">
                                {reportTypes.map((type) => (
                                    <Item
                                        key={type.id}
                                        variant={reportType === type.id ? "default" : "outline"}
                                        className={cn(
                                            "cursor-pointer transition-all duration-200 border-2",
                                            reportType === type.id ? "border-primary bg-primary/5" : "hover:border-primary/20"
                                        )}
                                        onClick={() => setReportType(type.id as any)}
                                    >
                                        <ItemMedia>
                                            <div className={cn("p-2 rounded-lg", type.bg, type.color)}>
                                                <type.icon className="size-5" />
                                            </div>
                                        </ItemMedia>
                                        <ItemContent>
                                            <ItemTitle className="font-bold">{type.title}</ItemTitle>
                                            <ItemDescription>{type.description}</ItemDescription>
                                        </ItemContent>
                                        {reportType === type.id && (
                                            <div className="pr-4">
                                                <CheckCircle2 className="size-5 text-primary" />
                                            </div>
                                        )}
                                    </Item>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter className="p-6 border-t bg-muted/30">
                    <div className="flex w-full items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isExporting}
                        >
                            Hủy
                        </Button>
                        <Button
                            className="px-8 font-bold"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <>
                                    <Spinner className="mr-2 size-4" />
                                    Đang xuất file...
                                </>
                            ) : (
                                <>
                                    <Download className="mr-2 size-4" />
                                    Xuất Excel
                                </>
                            )}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
