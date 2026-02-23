import { Video, Brain, BookOpen, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'

const features = [
    {
        icon: Video,
        title: 'Lớp học WebRTC',
        description: 'Tương tác trực tiếp không độ trễ. Bảng trắng thông minh và chia sẻ tài liệu real-time.',
    },
    {
        icon: Brain,
        title: 'AI Sensei trợ lực',
        description: 'Trợ lý AI đa năng hỗ trợ dịch thuật, giải thích ngữ pháp và phân tích lỗi sai 24/7.',
    },
    {
        icon: GraduationCap,
        title: 'Lộ trình cá nhân',
        description: 'Hệ thống tự động tùy chỉnh bài học theo trình độ JLPT và mục tiêu riêng của từng học viên.',
    },
    {
        icon: BookOpen,
        title: 'Kho học liệu mở',
        description: 'Hàng ngàn bài giảng, video và đề thi thử JLPT N5-N1 được biên soạn bởi các chuyên gia.',
    },
    {
        icon: Users,
        title: 'Cộng đồng Torii',
        description: 'Kết nối, trao đổi kinh nghiệm và tham gia các buổi học nhóm cùng cộng đồng giá trị.',
    },
    {
        icon: TrendingUp,
        title: 'Phân tích thông minh',
        description: 'Báo cáo chi tiết điểm mạnh, điểm yếu và dự đoán tỉ lệ đỗ JLPT chính xác qua từng giai đoạn.',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-20 bg-muted/30">
            <div className="container max-w-6xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col gap-4">
                    <div>
                        <Badge variant="secondary" className="px-3 py-1 font-bold text-[10px]">
                            Hệ sinh thái Torii
                        </Badge>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
                        Trải Nghiệm Học Tập Đỉnh Cao
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-balance">
                        Kết hợp tinh hoa sư phạm Nhật Bản với công nghệ AI tiên tiến, mang đến hiệu quả học tập vượt trội.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <Card key={i} className="group border shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-8 flex flex-col gap-4">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <feature.icon className="size-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
