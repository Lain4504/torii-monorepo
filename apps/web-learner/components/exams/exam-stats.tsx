import { Card, CardContent } from "@workspace/ui/components/card"
import { Trophy, Clock, Target, CheckCircle } from "lucide-react"

export function ExamStats() {
    const stats = [
        {
            label: "Đề thi đã làm",
            value: "12",
            icon: CheckCircle,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            label: "Điểm trung bình",
            value: "145/180",
            icon: Target,
            color: "text-teal-500",
            bg: "bg-teal-50 dark:bg-teal-900/20"
        },
        {
            label: "Giờ luyện thi",
            value: "24h",
            icon: Clock,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-900/20"
        },
        {
            label: "Chứng chỉ đạt được",
            value: "1",
            icon: Trophy,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-900/20"
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {stat.label}
                            </p>
                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {stat.value}
                            </h4>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}