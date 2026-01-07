import { Card, CardContent } from "@workspace/ui/components/card"
import { Trophy, Clock, Target, CheckCircle } from "lucide-react"

export function ExamStats() {
    const stats = [
        {
            label: "Đề thi đã làm",
            value: "12",
            icon: CheckCircle,
        },
        {
            label: "Điểm trung bình",
            value: "145/180",
            icon: Target,
        },
        {
            label: "Giờ luyện thi",
            value: "24h",
            icon: Clock,
        },
        {
            label: "Chứng chỉ đạt được",
            value: "1",
            icon: Trophy,
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                            <stat.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {stat.label}
                            </p>
                            <h4 className="text-2xl font-bold text-foreground">
                                {stat.value}
                            </h4>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}