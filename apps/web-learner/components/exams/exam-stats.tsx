import { Card, CardContent } from "@workspace/ui/components/card"
import { Trophy, Clock, Target, CheckCircle } from "lucide-react"

export function ExamStats() {
    const stats = [
        {
            label: "Đề thi đã làm",
            value: "12",
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            label: "Điểm trung bình",
            value: "145/180",
            icon: Target,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Giờ luyện thi",
            value: "24h",
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            label: "Chứng chỉ",
            value: "1",
            icon: Trophy,
            color: "text-primary",
            bg: "bg-primary/10"
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat) => (
                <div key={stat.label} className="group relative">
                    <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Card className="rounded-[2rem] border-border/40 bg-background/60 backdrop-blur-xl relative z-10 overflow-hidden hover:border-primary/20 transition-all duration-300">
                        <CardContent className="p-8 flex flex-col gap-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-foreground transition-colors">
                                    {stat.label}
                                </p>
                                <h4 className="text-3xl font-black text-foreground tracking-tighter italic">
                                    {stat.value}
                                </h4>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ))}
        </div>
    )
}