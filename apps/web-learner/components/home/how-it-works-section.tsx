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
        <section className="py-32 relative bg-muted/30 overflow-hidden">
            {/* Zen Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/[0.02] -skew-x-12 transform origin-top" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <h2 className="text-5xl md:text-6xl font-serif font-bold tracking-tight text-foreground uppercase italic">
                        Hành trình <span className="text-primary not-italic">Học Tập</span>
                    </h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-muted-foreground/40 italic">
                        Bốn bước đơn giản để thay đổi cách bạn chinh phục tiếng Nhật mãi mãi.
                    </p>
                </div>

                {/* Steps Grid */}
                <div className="grid lg:grid-cols-4 gap-12 relative">
                    {/* Desktop Connector Line */}
                    <div className="hidden lg:block absolute top-[2.75rem] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                    {steps.map((step, index) => {
                        const Icon = step.icon
                        return (
                            <div key={index} className="flex flex-col items-center group">
                                {/* Step Icon Box */}
                                <div className={cn(
                                    "w-24 h-24 rounded-[2rem] flex items-center justify-center relative mb-8 transition-all duration-700 group-hover:scale-110",
                                    step.bg,
                                    step.color
                                )}>
                                    <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-background border border-border/10 flex items-center justify-center text-[11px] font-black text-foreground shadow-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                        0{index + 1}
                                    </div>
                                    <Icon className="w-10 h-10" />
                                </div>

                                {/* Step Content */}
                                <div className="text-center space-y-4 px-4">
                                    <h3 className="text-xl font-serif font-bold italic text-foreground group-hover:text-primary transition-all">
                                        {step.title}
                                    </h3>
                                    <p className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Mobile Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden my-8">
                                        <ChevronRight className="w-6 h-6 text-muted-foreground/20 rotate-90" />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Bottom Tip */}
                <div className="mt-20 text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-background/50 backdrop-blur-sm border border-border/40 rounded-full">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tư duy tự chủ là chìa khóa của thành công</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
