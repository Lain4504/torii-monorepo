import { Video, Brain, BookOpen, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'

const features = [
    {
        icon: Video,
        title: 'Lớp học WebRTC',
        description: 'Tương tác trực tiếp không độ trễ. Bảng trắng thông minh và chia sẻ tài liệu real-time.',
        color: 'text-blue-600',
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
        color: 'text-purple-600',
        bg: 'bg-purple-500/10',
    },
    {
        icon: BookOpen,
        title: 'Kho học liệu mở',
        description: 'Hàng ngàn bài giảng, video và đề thi thử JLPT N5-N1 được biên soạn bởi các chuyên gia.',
        color: 'text-amber-600',
        bg: 'bg-amber-500/10',
    },
    {
        icon: Users,
        title: 'Cộng đồng Torii',
        description: 'Kết nối, trao đổi kinh nghiệm và tham gia các buổi học nhóm cùng cộng đồng hàng ngàn học viên.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-500/10',
    },
    {
        icon: TrendingUp,
        title: 'Phân tích thông minh',
        description: 'Báo cáo chi tiết điểm mạnh, điểm yếu và dự đoán tỉ lệ đỗ JLPT chính xác qua từng giai đoạn.',
        color: 'text-rose-600',
        bg: 'bg-rose-500/10',
    },
]

export function FeaturesSection() {
    return (
        <section className="py-20 border-t bg-muted/30">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                    <p className="text-sm font-semibold text-primary">Hệ sinh thái Torii</p>
                    <h2 className="text-3xl font-bold tracking-tight">Trải Nghiệm Học Tập Đỉnh Cao</h2>
                    <p className="text-muted-foreground">
                        Kết hợp tinh hoa sư phạm Nhật Bản với công nghệ AI tiên tiến, mang đến hiệu quả học tập vượt trội.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature, i) => (
                        <div key={i} className="p-6 rounded-xl bg-card border hover:border-primary/30 transition-colors">
                            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', feature.bg, feature.color)}>
                                <feature.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
