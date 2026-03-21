import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Video, BookOpen, Target, MessageSquare } from "lucide-react"
import { StatsCard } from "./stats-card"

export default function LecturerDashboard() {
    const myCourses = { total: 0 };

    return (
        <div className="space-y-6">
            <div className="relative group rounded-3xl border border-primary/20 bg-card p-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-700">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] -z-10 rounded-full -translate-x-1/2 translate-y-1/2" />

                <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 max-w-xl">
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest px-3 bg-primary/10 text-primary border-none">Trực tiếp</Badge>
                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Phòng học đang mở</span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-5xl font-black tracking-tighter leading-[0.9]">Masterclass <br /><span className="text-primary">Kaiwa N4</span></h2>
                            <p className="text-muted-foreground font-medium">Bắt đầu sau: <span className="text-primary font-black tabular-nums">24:32</span></p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button size="lg" className="rounded-2xl font-black text-[11px] uppercase tracking-widest px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-all">Vào Lớp Ngay</Button>
                            <Button variant="outline" size="lg" className="rounded-2xl font-black text-[11px] uppercase tracking-widest px-10 border-border/50 hover:bg-muted/50 transition-all">Chuẩn bị tài liệu</Button>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center justify-center relative scale-110">
                        <div className="size-48 rounded-[40px] bg-gradient-to-br from-primary to-indigo-600 shadow-2xl rotate-6 flex items-center justify-center">
                            <Video className="size-20 text-white/20" />
                        </div>
                        <div className="absolute -top-4 -right-4 size-24 rounded-3xl bg-background border-4 border-card shadow-xl flex flex-col items-center justify-center -rotate-12">
                            <span className="text-2xl font-black text-primary">24</span>
                            <span className="text-[8px] font-bold uppercase text-muted-foreground">Học viên</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <StatsCard
                    title="Khóa học của tôi"
                    value={myCourses?.total || 0}
                    sub="Khung chương trình đang biên soạn"
                    icon={BookOpen}
                    highlight
                />
                <StatsCard title="Bài tập cần chấm" value="12" sub="Học viên đang chờ kết quả" icon={Target} />
                <StatsCard title="Câu hỏi chưa trả lời" value="05" sub="Tương tác mới từ bài giảng" icon={MessageSquare} />
            </div>
        </div>
    )
}
