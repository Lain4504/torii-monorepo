import { UserPlus, Compass, BookOpen, GraduationCap, ChevronRight } from 'lucide-react'

const steps = [
    {
        icon: UserPlus,
        title: 'Đăng Ký Tài Khoản',
        description: 'Chỉ mất 30 giây để bắt đầu. Hệ thống thiết lập không gian học tập riêng cho bạn ngay lập tức.',
    },
    {
        icon: Compass,
        title: 'Chọn Lộ Trình Học',
        description: 'Tự do lựa chọn hoặc để AI gợi ý khóa học phù hợp nhất với trình độ hiện tại của bạn.',
    },
    {
        icon: BookOpen,
        title: 'Học & Thực Hành',
        description: 'Tương tác trên lớp trực tuyến và ôn tập bền vững qua hệ thống Flashcard thông minh.',
    },
    {
        icon: GraduationCap,
        title: 'Chứng Nhận Kỹ Năng',
        description: 'Hoàn thành khóa học, vượt qua bài kiểm tra cuối khóa và nhận chứng chỉ JLPT từ Torii.',
    },
]

export function HowItWorksSection() {
    return (
        <section className="py-20 border-t bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">
                        Hành trình <span className="text-primary">Học Tập</span>
                    </h2>
                    <p className="text-muted-foreground">
                        Bốn bước đơn giản để thay đổi cách bạn chinh phục tiếng Nhật.
                    </p>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <div className="relative mb-5">
                                <div className="w-16 h-16 rounded-xl border bg-card flex items-center justify-center">
                                    <step.icon className="w-7 h-7 text-primary" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                </div>
                            </div>
                            <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                            {i < steps.length - 1 && (
                                <div className="lg:hidden mt-4">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground/30 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
