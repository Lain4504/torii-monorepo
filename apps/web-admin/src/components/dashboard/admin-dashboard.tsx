import { Link } from "react-router-dom"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
    AlertCircle,
    FileSearch,
    Video,
    DollarSign,
    ChevronRight,
    ShieldAlert,
    MessageSquare,
    Zap,
    BookOpen,
    Terminal,
    History,
    Activity
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { usePlatformOverview } from "@/lib/api/services/analytics"
import { formatNumber, formatCurrency } from "@/lib/format-utils"
import { PageLoading } from "@workspace/ui/components/page-loading"
import { StatsCard } from "./stats-card"

export function OperationItem({ icon: Icon, title, desc, tag, tagColor, time, link }: any) {
    const colorClasses: any = {
        rose: "bg-rose-500/10 text-rose-500",
        amber: "bg-amber-500/10 text-amber-500",
        primary: "bg-primary/10 text-primary",
        blue: "bg-blue-500/10 text-blue-500",
        emerald: "bg-emerald-500/10 text-emerald-500"
    }
    return (
        <div className="group flex items-center gap-4 p-5 hover:bg-muted/10 transition-all cursor-pointer">
            <div className={cn("size-12 flex items-center justify-center rounded-xl bg-background transition-colors group-hover:bg-muted/20 group-hover:shadow-sm", colorClasses[tagColor]?.split(' ')[1])}>
                <Icon className="size-5" />
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{title}</h4>
                    <Badge variant="outline" className={cn("text-[10px] font-medium py-0 h-4 border-none", colorClasses[tagColor])}>{tag}</Badge>
                </div>
                <p className="text-xs text-muted-foreground/60 truncate">{desc}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-[10px] font-medium text-muted-foreground/40 mb-1">{time}</p>
                <Link to={link}>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="font-semibold hover:bg-primary/5 hover:text-primary shadow-none"
                    >
                        Xử lý
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export function PulseMetric({ label, value, color, icon: Icon }: any) {
    const colors: any = {
        emerald: "bg-emerald-500",
        primary: "bg-primary",
        amber: "bg-amber-500"
    }
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={cn("size-2 rounded-full animate-pulse", colors[color])} />
                <span className="text-xs font-semibold text-muted-foreground/70">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold">{formatNumber(value)}</span>
                {Icon && <Icon className="size-4 text-muted-foreground/30" />}
            </div>
        </div>
    )
}

export function LogItem({ time, user, action }: any) {
    return (
        <div className="flex items-start gap-3">
            <span className="text-[10px] font-semibold text-muted-foreground/40 pt-0.5">{time}</span>
            <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">{user}</p>
                <p className="text-xs font-medium text-muted-foreground/70 leading-relaxed">{action}</p>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { data, isLoading } = usePlatformOverview()

    if (isLoading) return <div className="h-96 flex items-center justify-center"><PageLoading /></div>

    const formatCurrencyLocal = (amount: number) => {
        return formatCurrency(amount)
    }

    const overview = data?.overview

    return (
        <div className="space-y-8">
            {/* Priority Action Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <StatsCard
                    title="Yêu cầu Hoàn tiền"
                    value={overview?.pendingRefunds || 0}
                    sub="Cần xử lý ngay lập tức"
                    icon={AlertCircle}
                    highlight={Number(overview?.pendingRefunds) > 0}
                />
                <StatsCard
                    title="Duyệt Khóa học"
                    value={overview?.pendingApprovals || 0}
                    sub="Đang chờ kiểm định nội dung"
                    icon={FileSearch}
                    highlight={Number(overview?.pendingApprovals) > 0}
                />
                <StatsCard
                    title="Lớp học Trực tiếp"
                    value={overview?.activeRooms || 0}
                    sub="Phiên live đang diễn ra"
                    icon={Video}
                />
                <StatsCard
                    title="Doanh thu Hôm nay"
                    value={formatCurrencyLocal(overview?.totalRevenue ? overview.totalRevenue / 30 : 0)}
                    sub="Cập nhật 5 phút trước"
                    icon={DollarSign}
                    trend="+5%"
                />
            </div>

            <div className="grid gap-6 md:grid-cols-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                {/* Operational Queue */}
                <Card className="md:col-span-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Hàng đợi <span className="text-primary">vận hành</span></CardTitle>
                                <CardDescription>Tác vụ cần xử lý ưu tiên từ cao xuống thấp</CardDescription>
                            </div>
                            <Button size="sm" variant="ghost" className="shadow-none">
                                Xem toàn bộ <ChevronRight className="ml-1 size-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/30">
                            {/* Pending Refund Item */}
                            {Number(overview?.pendingRefunds) > 0 && (
                                <OperationItem
                                    icon={DollarSign}
                                    title="Phê duyệt Hoàn tiền #RF-5902"
                                    desc="Học viên: Lê Minh - Lý do: Nội dung không phù hợp"
                                    tag="KHẨN CẤP"
                                    tagColor="rose"
                                    time="15 phút trước"
                                    link="/tickets"
                                />
                            )}
                            {/* Pending Course Approval */}
                            <OperationItem
                                icon={BookOpen}
                                title="Kiểm duyệt: Khóa học N3 Cấp tốc"
                                desc="Giảng viên: Tanaka Sensei - 24 bài giảng mới"
                                tag="NỘI DUNG"
                                tagColor="amber"
                                time="1 giờ trước"
                                link="/academy/course-profiles"
                            />
                            {/* High Value Transaction */}
                            <OperationItem
                                icon={Zap}
                                title="Đơn hàng Giá trị cao #ORD-882"
                                desc="Giao dịch 2.500.000đ - Đang chờ xác nhận ngân hàng"
                                tag="TÀI CHÍNH"
                                tagColor="primary"
                                time="3 giờ trước"
                                link="/orders"
                            />
                            {/* System Audit */}
                            <OperationItem
                                icon={ShieldAlert}
                                title="Cảnh báo: Đăng nhập thất bại hàng loạt"
                                desc="Phát hiện 12 attempts từ IP lạ 1.5.234.xx"
                                tag="BẢO MẬT"
                                tagColor="rose"
                                time="6 giờ trước"
                                link="/audit-logs"
                            />
                            <OperationItem
                                icon={MessageSquare}
                                title="Ticket Hỗ trợ mới #ST-992"
                                desc="Không thể truy cập Mobile App trên iOS 17"
                                tag="SUPPORT"
                                tagColor="blue"
                                time="8 giờ trước"
                                link="/tickets"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Platform Pulse */}
                <div className="md:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tổng quan hệ thống</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <PulseMetric label="Người dùng Trực tuyến" value={overview?.activeToday || 0} color="emerald" icon={Activity} />
                            <PulseMetric label="Phòng học Active" value={overview?.activeRooms || 0} color="primary" icon={Video} />
                            <PulseMetric label="Ticket Đang mở" value={overview?.pendingTickets || 0} color="amber" icon={MessageSquare} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Terminal className="size-4 text-primary" />
                                <CardTitle>Nhật ký hoạt động</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <LogItem time="12:45" user="Admin" action="Cập nhật cấu hình Coupon" />
                            <LogItem time="12:32" user="System" action="Tự động gia hạn 12 Subscription" />
                            <LogItem time="11:58" user="Sarah" action="Phê duyệt User 'Nguyễn Văn A'" />
                            <LogItem time="10:15" user="Linh" action="Phản hồi Ticket #991" />
                            <Button variant="link" className="w-full text-xs font-semibold text-muted-foreground/60 hover:text-primary h-auto p-0 pt-2 shadow-none">
                                Xem Log chi tiết <History className="ml-1.5 size-3.5" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
