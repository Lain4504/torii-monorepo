import { Rocket, Heart, Users, BookOpen } from 'lucide-react'

const metrics = [
    { value: '50K+', label: 'Học viên tích cực', sub: 'đang chinh phục JLPT mỗi ngày', icon: Users },
    { value: '98%', label: 'Tỉ lệ hài lòng', sub: 'trong khảo sát sau khóa học', icon: Heart },
    { value: '4.9★', label: 'Điểm đánh giá', sub: 'tổng hợp từ Google & App Store', icon: Rocket },
    { value: '180+', label: 'Khóa học & bài giảng', sub: 'phủ toàn bộ cấp độ N5 đến N1', icon: BookOpen },
]

export function TrustSection() {
    return (
        <section className="border-y bg-muted/40">
            <div className="container max-w-6xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
                    {metrics.map((m, i) => {
                        const Icon = m.icon
                        return (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center gap-2 py-10 px-6 group hover:bg-background transition-colors duration-200 cursor-default"
                            >
                                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-1 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                    <Icon className="size-4" />
                                </div>
                                <p className="text-3xl font-extrabold tracking-tight group-hover:text-primary transition-colors duration-200">
                                    {m.value}
                                </p>
                                <p className="text-sm font-semibold text-foreground">{m.label}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed">{m.sub}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
