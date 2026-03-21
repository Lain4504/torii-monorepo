import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import {
    Zap,
    Calendar,
    MessageSquare,
    Users,
    CheckCircle2,
    ArrowUpRight,
    BookOpen
} from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { usePlatformOverview } from "@/lib/api/services/analytics"
import { StatsCard } from "./stats-card"
import { OperationItem } from "./admin-dashboard"

function TaskItem({ title, status, code }: { title: string, status: string, code: string }) {
    const isUrgent = status === 'Khẩn cấp';
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer group border border-border/10 hover:border-primary/20">
            <div className={cn(
                "size-10 flex items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105",
                isUrgent ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
            )}>
                <CheckCircle2 className="size-4.5" />
            </div>
            <div className="flex-1 space-y-0.5">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">{title}</p>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted-foreground/40">{code}</span>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className={cn("text-[10px] font-bold uppercase", isUrgent ? "text-rose-500" : "text-primary/70")}>{status}</span>
                </div>
            </div>
            <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-40 transition-all -translate-y-1 group-hover:translate-x-1" />
        </div>
    )
}

export default function StaffDashboard() {
    const { data } = usePlatformOverview()
    const overview = data?.overview
    const pendingCourses = { total: 0 };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <StatsCard
                    title="Chờ Phê duyệt"
                    value={pendingCourses?.total || 0}
                    sub="Khóa học đang chờ kiểm duyệt"
                    icon={Zap}
                    highlight={Number(pendingCourses?.total) > 0}
                />
                <StatsCard title="Lịch Live" value={overview?.activeRooms || 0} sub="Buổi dạy trực tiếp hôm nay" icon={Calendar} />
                <StatsCard title="Ticket Mới" value={overview?.pendingTickets || 0} sub="Cần phản hồi hỗ trợ" icon={MessageSquare} highlight={Number(overview?.pendingTickets) > 0} />
                <StatsCard title="Người dùng" value={overview?.totalUsers || 0} sub="Học viên đã tham gia" icon={Users} />
            </div>

            <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                <Card>
                    <CardHeader>
                        <CardTitle>Kế hoạch vận hành</CardTitle>
                        <CardDescription>Danh sách công việc cần làm trong ca trực</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6 space-y-3">
                        <TaskItem title="Duyệt video 'Mina no Nihongo Bài 12'" status="Khẩn cấp" code="CONT-502" />
                        <TaskItem title="Verify danh tính Giảng viên mới" status="Bình thường" code="USER-102" />
                        <TaskItem title="Check chất lượng Room #LIVE-29" status="Ưu tiên" code="SYS-309" />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Cập nhật giảng viên</CardTitle>
                        <CardDescription>Phản hồi và câu hỏi từ đội ngũ giảng dạy</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/30">
                            <OperationItem icon={MessageSquare} title="Tanaka Sensei: Lỗi Live Stream" desc="Room #LIVE-24 bị delay âm thanh" tag="Lỗi" tagColor="rose" time="10m" link="/tickets" />
                            <OperationItem icon={BookOpen} title="Linh Nguyễn: Bài tập mới" desc="Vừa cập nhật bộ đề JLPT N4 mới" tag="Review" tagColor="amber" time="45m" link="/reviews" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
