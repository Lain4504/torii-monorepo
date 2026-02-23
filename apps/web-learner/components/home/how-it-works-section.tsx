import { UserPlus, Compass, BookOpen, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'

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
        <section className="py-20 lg:py-24">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Hành trình Học Tập
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Bốn bước đơn giản để thay đổi cách bạn chinh phục tiếng Nhật.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-6 group">
                            <div className="relative">
                                <Card className="size-20 flex items-center justify-center rounded-lg bg-background border shadow-sm">
                                    <step.icon className="size-8 text-primary" />
                                </Card>
                                <Badge className="absolute -top-1 -right-1 size-7 flex items-center justify-center rounded-full p-0 font-bold text-xs ring-4 ring-background">
                                    {i + 1}
                                </Badge>
                            </div>
                            <div className="space-y-3 px-4">
                                <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                    {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
