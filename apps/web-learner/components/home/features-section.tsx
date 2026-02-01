'use client'

import { Video, Brain, BookOpen, GraduationCap, Users, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const features = [
    {
        icon: Video,
        title: 'Lớp học WebRTC',
        description: 'Tương tác trực tiếp không độ trễ. Bảng trắng thông minh và chia sẻ tài liệu real-time.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
    },
    {
        icon: Brain,
        title: 'AI Sensei trợ lực',
        description: 'Trợ lý AI đa năng hỗ trợ dịch thuật, giải thích ngữ pháp và phân tích lỗi sai 24/7.',
        color: 'text-primary',
        bg: 'bg-primary/10',
    },
    {
        icon: GraduationCap,
        title: 'Lộ trình cá nhân',
        description: 'Hệ thống tự động tùy chỉnh bài học theo trình độ JLPT và mục tiêu riêng của từng học viên.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
    },
    {
        icon: BookOpen,
        title: 'Kho học liệu mở',
        description: 'Hàng ngàn bài giảng, video và đề thi thử JLPT N5-N1 được biên soạn bởi các chuyên gia.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
    },
    {
        icon: Users,
        title: 'Cộng đồng Torii',
        description: 'Kết nối, trao đổi kinh nghiệm và tham gia các buổi học nhóm cùng cộng đồng hàng ngàn học viên.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: TrendingUp,
        title: 'Phân tích thông minh',
        description: 'Báo cáo chi tiết điểm mạnh, điểm yếu và dự đoán tỉ lệ đỗ JLPT chính xác qua từng giai đoạn.',
        color: 'text-rose-500',
        bg: 'bg-rose-500/10',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hệ sinh thái Torii</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-sans font-bold text-foreground tracking-tight">
                        Trải Nghiệm Học Tập Đỉnh Cao
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        Kết hợp tinh hoa sư phạm Nhật Bản với công nghệ AI tiên tiến,
                        mang đến hiệu quả học tập vượt trội.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="group p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                            >
                                {/* Icon Box */}
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300",
                                    feature.bg,
                                    feature.color
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>

                                {/* Content */}
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold text-foreground">
                                        {feature.title}
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
