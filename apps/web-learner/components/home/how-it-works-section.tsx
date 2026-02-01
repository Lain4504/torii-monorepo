'use client'

import { cn } from '@workspace/ui/lib/utils'
import { UserPlus, Compass, BookOpen, GraduationCap, ChevronRight } from 'lucide-react'

const steps = [
    {
        icon: UserPlus,
        title: 'Đăng Ký Tài Khoản',
        description: 'Chỉ mất 30 giây để bắt đầu. Hệ thống sẽ ngay lập tức thiết lập không gian học tập riêng cho bạn.',
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        icon: Compass,
        title: 'Chọn Lộ Trình Học',
        description: 'Tự do lựa chọn hoặc sử dụng AI để gợi ý khóa học phù hợp nhất với trình độ hiện tại của bạn.',
        color: 'text-primary',
        bg: 'bg-primary/10'
    },
    {
        icon: BookOpen,
        title: 'Học & Thực Hành',
        description: 'Tương tác trực tiếp trên lớp và ôn tập kiến thức bền vững qua hệ thống Flashcard thông minh.',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        icon: GraduationCap,
        title: 'Chứng Nhận Kỹ Năng',
        description: 'Hoàn thành khóa học, vượt qua bài kiểm tra cuối khóa và nhận chứng chỉ JLPT nội bộ từ Torii.',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10'
    },
]

export function HowItWorksSection() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-sans font-bold text-foreground tracking-tight">
                        Hành trình <span className="text-primary">Học Tập</span>
                    </h2>
                    <p className="text-lg text-muted-foreground font-medium">
                        Bốn bước đơn giản để thay đổi cách bạn chinh phục tiếng Nhật mãi mãi.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid lg:grid-cols-4 gap-8 relative">
                    {/* Desktop Connector Line */}
                    <div className="hidden lg:block absolute top-[2.5rem] left-[10%] right-[10%] h-[2px] bg-border border-t border-dashed border-muted-foreground/30" />

                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div key={index} className="flex flex-col items-center group relative z-10">
                                {/* Step Icon Box */}
                                <div className={cn(
                                    "w-20 h-20 rounded-2xl flex items-center justify-center relative mb-6 transition-all duration-500 group-hover:scale-110 shadow-sm",
                                    step.bg,
                                    step.color,
                                    "bg-card border border-border"
                                )}>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg">
                                        {index + 1}
                                    </div>
                                    <Icon className="w-8 h-8" />
                                </div>

                                {/* Step Content */}
                                <div className="text-center space-y-3 px-2">
                                    <h3 className="text-lg font-sans font-bold text-foreground group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Mobile Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden my-6">
                                        <ChevronRight className="w-6 h-6 text-muted-foreground/20 rotate-90" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
