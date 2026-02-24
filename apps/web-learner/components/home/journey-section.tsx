import { Rocket, Map, Activity, Flag } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'

const steps = [
    {
        icon: Rocket,
        step: 'Mission 01',
        title: 'Ghi danh & Khởi hành',
        description: 'Chỉ mất 30 giây để thiết lập phi thuyền của bạn. AI đánh giá trình độ và chuẩn bị nhiên liệu học tập cho hành trình phía trước.',
    },
    {
        icon: Map,
        step: 'Mission 02',
        title: 'Vẽ bản đồ quỹ đạo',
        description: 'Dựa trên mục tiêu JLPT của bạn, hệ thống AI tính toán lộ trình tối ưu nhất — tránh những "hố đen" kiến thức và tối ưu thời gian học.',
    },
    {
        icon: Activity,
        step: 'Mission 03',
        title: 'Hành trình khám phá',
        description: 'Tham gia lớp học trực tuyến WebRTC, thu thập kiến thức qua Flashcard SRS và nhận chỉ dẫn 24/7 từ trung tâm điều khiển AI Sensei.',
    },
    {
        icon: Flag,
        step: 'Mission 04',
        title: 'Đổ bộ & Chạm đích',
        description: 'Vượt qua bài thi mô phỏng, nhận chứng chỉ Torii và tự tin đổ bộ vào kỳ thi JLPT thực tế với tỉ lệ đỗ cao nhất.',
    },
]

export function JourneySection() {
    return (
        <section className="py-24 lg:py-32 bg-muted/40 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 size-96 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 size-96 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

            <div className="container max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="max-w-xl mx-auto text-center mb-20 space-y-3">
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 text-sm font-medium">
                        Hành trình chinh phục
                    </Badge>
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                        4 Giai Đoạn Vượt Vũ Trụ
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                        Quy trình học tập khoa học giúp bạn bay xa hơn trên con đường tiếng Nhật.
                    </p>
                </div>

                {/* Steps */}
                <div className="relative">
                    {/* Vertical line connector desktop */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 z-0" />

                    <div className="space-y-12 md:space-y-0 relative z-10">
                        {steps.map((s, i) => {
                            const Icon = s.icon
                            const isLeft = i % 2 === 0
                            return (
                                <div
                                    key={i}
                                    className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 pb-12 md:pb-24 last:pb-0 ${isLeft ? '' : 'md:flex-row-reverse'}`}
                                >
                                    {/* Text side */}
                                    <div className={`flex-1 space-y-3 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                        <p className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
                                            {s.step}
                                        </p>
                                        <h3 className="text-xl font-bold tracking-tight">{s.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-sm max-w-sm mx-auto md:mx-0">
                                            {isLeft ? <span className="block md:ml-auto">{s.description}</span> : s.description}
                                        </p>
                                    </div>

                                    {/* Center icon */}
                                    <div className="shrink-0 flex flex-col items-center relative">
                                        <div className="size-16 rounded-2xl bg-background border-2 border-primary/20 flex items-center justify-center shadow-sm group hover:border-primary hover:rotate-12 hover:scale-110 transition-all duration-300 cursor-default relative z-20">
                                            <Icon className="size-8 text-primary" />
                                        </div>
                                        {/* Step number circle on mobile only or subtle indicator */}
                                        <div className="absolute -top-2 -right-2 size-6 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center border-2 border-background md:hidden">
                                            {i + 1}
                                        </div>
                                    </div>

                                    {/* Spacer side */}
                                    <div className="flex-1 hidden md:block" />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
