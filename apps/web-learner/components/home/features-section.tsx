'use client'

import { Video, Brain, BookOpen, GraduationCap, Users, TrendingUp, Sparkles } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const features = [
    {
        icon: Video,
        title: 'Lớp học WebRTC',
        description: 'Tương tác trực tiếp không độ trễ. Bảng trắng thông minh và chia sẻ tài liệu real-time.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/5',
    },
    {
        icon: Brain,
        title: 'AI Sensei trợ lực',
        description: 'Trợ lý AI đa năng hỗ trợ dịch thuật, giải thích ngữ pháp và phân tích lỗi sai 24/7.',
        color: 'text-primary',
        bg: 'bg-primary/5',
    },
    {
        icon: GraduationCap,
        title: 'Lộ trình cá nhân',
        description: 'Hệ thống tự động tùy chỉnh bài học theo trình độ JLPT và mục tiêu riêng của từng học viên.',
        color: 'text-purple-500',
        bg: 'bg-purple-500/5',
    },
    {
        icon: BookOpen,
        title: 'Kho học liệu mở',
        description: 'Hàng ngàn bài giảng, video và đề thi thử JLPT N5-N1 được biên soạn bởi các chuyên gia.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/5',
    },
    {
        icon: Users,
        title: 'Cộng đồng Torii',
        description: 'Kết nối, trao đổi kinh nghiệm và tham gia các buổi học nhóm cùng cộng đồng hàng ngàn học viên.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/5',
    },
    {
        icon: TrendingUp,
        title: 'Phân tích thông minh',
        description: 'Báo cáo chi tiết điểm mạnh, điểm yếu và dự đoán tỉ lệ đỗ JLPT chính xác qua từng giai đoạn.',
        color: 'text-rose-500',
        bg: 'bg-rose-500/5',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-32 relative overflow-hidden bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Zen Section Header */}
                <div className="text-center max-w-4xl mx-auto mb-24 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 text-primary rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                        <Sparkles className="w-3 h-3" />
                        <span>Hệ sinh thái Torii</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-foreground uppercase italic leading-[0.9]">
                        Trải Nghiệm <span className="text-primary not-italic">Học Tập</span> <br /> Đỉnh Cao
                    </h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic border-l-2 border-primary/20 pl-8 max-w-2xl mx-auto text-left py-2">
                        Tinh hoa sư phạm Nhật Bản • Công nghệ AI thế hệ mới • Kết nối thời gian thực
                    </p>
                </div>

                {/* Features Grid - Zen Style */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                className="group relative p-10 rounded-[2.5rem] bg-muted/20 border border-border/40 hover:bg-background hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-default"
                            >
                                {/* Icon Box */}
                                <div className={cn(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-500 group-hover:-rotate-3",
                                    feature.bg,
                                    feature.color
                                )}>
                                    <Icon className="w-8 h-8" />
                                </div>

                                {/* Content */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-serif font-bold italic text-foreground group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-[11px] font-medium text-muted-foreground/60 leading-relaxed uppercase tracking-wider">
                                        {feature.description}
                                    </p>
                                </div>

                                {/* Decorative Element */}
                                <div className="absolute top-8 right-8 text-[10px] font-black text-muted-foreground/10 uppercase tracking-widest italic group-hover:text-primary/10 transition-colors">
                                    0{index + 1}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
